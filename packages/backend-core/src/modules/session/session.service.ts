import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { SessionData } from '@workspace/contract';

import { sessionConfig, SessionConfig } from '@/modules/config';
import { RedisService } from '@/modules/redis';

import { SessionCreationInput, SessionRecord } from './session.types';

interface CookieReply {
  clearCookie: (name: string, options?: Record<string, unknown>) => void;
  setCookie: (name: string, value: string, options?: Record<string, unknown>) => void;
}

interface SignedCookieRequest {
  cookies: Record<string, string | undefined>;
  unsignCookie?: (value: string) => { valid: boolean; value: string | null };
}

@Injectable()
export class SessionService {
  constructor(
    private readonly redis: RedisService,
    @Inject(sessionConfig.KEY)
    private readonly config: SessionConfig,
  ) {}

  async createSession(input: SessionCreationInput) {
    const sessionId = uuidv4();
    const createdAt = new Date().toISOString();

    const session: SessionRecord = {
      sessionId,
      userId: input.userId,
      userRole: input.userRole,
      name: input.name,
      os: input.os,
      device: input.device,
      userAgent: input.userAgent,
      createdAt,
    };

    await this.redis.set(this.getSessionKey(sessionId), JSON.stringify(session), 'EX', this.config.ttlSeconds);
    await this.redis.sadd(this.getUserSessionsKey(input.userId), sessionId);
    await this.redis.expire(this.getUserSessionsKey(input.userId), this.config.ttlSeconds);

    return session;
  }

  async getSession(sessionId: string) {
    const raw = await this.redis.get(this.getSessionKey(sessionId));

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as SessionRecord;
  }

  async getRequestSession(request: SignedCookieRequest) {
    const sessionId = this.getSessionIdFromRequest(request);

    if (!sessionId) {
      return null;
    }

    return this.getSession(sessionId);
  }

  async listUserSessions(userId: string) {
    const indexKey = this.getUserSessionsKey(userId);
    const sessionIds = await this.redis.smembers(indexKey);

    if (sessionIds.length === 0) {
      return [];
    }

    const sessions = await Promise.all(sessionIds.map((sessionId) => this.getSession(sessionId)));
    const staleSessionIds: string[] = [];
    const activeSessions: SessionRecord[] = [];

    sessions.forEach((session, index) => {
      const sessionId = sessionIds[index];

      if (!session || session.userId !== userId) {
        if (sessionId) {
          staleSessionIds.push(sessionId);
        }
        return;
      }

      activeSessions.push(session);
    });

    if (staleSessionIds.length > 0) {
      await this.redis.srem(indexKey, ...staleSessionIds);
    }

    return activeSessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async revokeSession(sessionId: string) {
    const session = await this.getSession(sessionId);

    await this.redis.del(this.getSessionKey(sessionId));

    if (session) {
      await this.redis.srem(this.getUserSessionsKey(session.userId), sessionId);
    }
  }

  async revokeUserSession(userId: string, sessionId: string) {
    const session = await this.getSession(sessionId);

    if (!session) {
      await this.redis.srem(this.getUserSessionsKey(userId), sessionId);
      return false;
    }

    if (session.userId !== userId) {
      return false;
    }

    await this.redis.del(this.getSessionKey(sessionId));
    await this.redis.srem(this.getUserSessionsKey(userId), sessionId);

    return true;
  }

  async revokeUserSessions(userId: string) {
    const key = this.getUserSessionsKey(userId);
    const sessionIds = await this.redis.smembers(key);

    if (sessionIds.length > 0) {
      await this.redis.del(...sessionIds.map((sessionId) => this.getSessionKey(sessionId)));
    }

    await this.redis.del(key);
  }

  setSessionCookie(reply: CookieReply, sessionId: string) {
    reply.setCookie(this.config.cookieName, sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: this.config.cookieSameSite,
      secure: this.config.cookieSecure,
      signed: true,
      maxAge: this.config.ttlSeconds,
    });
  }

  clearSessionCookie(reply: CookieReply) {
    reply.clearCookie(this.config.cookieName, {
      path: '/',
      httpOnly: true,
      sameSite: this.config.cookieSameSite,
      secure: this.config.cookieSecure,
      signed: true,
    });
  }

  toSessionData(session: SessionRecord): SessionData {
    return {
      sessionId: session.sessionId,
      userId: session.userId,
      userRole: session.userRole,
      createdAt: session.createdAt,
    };
  }

  getSessionIdFromRequest(request: SignedCookieRequest) {
    const cookie = request.cookies?.[this.config.cookieName];

    if (!cookie) {
      return null;
    }

    if (!request.unsignCookie) {
      return cookie;
    }

    const unsigned = request.unsignCookie(cookie);
    if (!unsigned.valid || !unsigned.value) {
      return null;
    }

    return unsigned.value;
  }

  private getSessionKey(sessionId: string) {
    return `session:${sessionId}`;
  }

  private getUserSessionsKey(userId: string) {
    return `user-sessions:${userId}`;
  }
}
