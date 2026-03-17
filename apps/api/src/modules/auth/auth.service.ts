import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import UAParser = require('ua-parser-js');

import {
  AccessDeniedError,
  apiOk,
  ClientContext,
  DomainException,
  PrismaService,
  SessionConfig,
  SessionService,
  sessionConfig,
} from '@workspace/backend-core';
import { Prisma, UserRole as DatabaseUserRole } from '@workspace/database';
import { UserRole, UserStatus } from '@workspace/contract';

import { GoogleIdTokenService } from './google-id-token.service';

const GOOGLE_OAUTH_NONCE_COOKIE = 'google_oauth_nonce';
const GOOGLE_OAUTH_NONCE_TTL_SECONDS = 60 * 10;

interface CookieReply {
  clearCookie: (name: string, options?: Record<string, unknown>) => void;
  setCookie: (name: string, value: string, options?: Record<string, unknown>) => void;
}

interface SignedCookieRequest {
  cookies: Record<string, string | undefined>;
  unsignCookie?: (value: string) => { valid: boolean; value: string | null };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleIdTokenService: GoogleIdTokenService,
    private readonly sessionService: SessionService,
    private readonly clientContext: ClientContext,
    @Inject(sessionConfig.KEY)
    private readonly sessionCfg: SessionConfig,
  ) {}

  async startGoogleOAuth(redirectUrl: string, reply: CookieReply) {
    try {
      this.googleIdTokenService.assertAllowedRedirectUrl(redirectUrl);
    } catch {
      throw new DomainException(new AccessDeniedError());
    }

    const nonce = this.googleIdTokenService.createNonce();
    const authorizationUrl = this.googleIdTokenService.buildAuthorizationUrl(redirectUrl, nonce);

    reply.setCookie(GOOGLE_OAUTH_NONCE_COOKIE, nonce, {
      path: '/',
      httpOnly: true,
      signed: true,
      sameSite: this.sessionCfg.cookieSameSite,
      secure: this.sessionCfg.cookieSecure,
      maxAge: GOOGLE_OAUTH_NONCE_TTL_SECONDS,
    });

    return apiOk(200, {
      data: {
        authorizationUrl,
      },
      meta: {},
    });
  }

  async completeGoogleOAuth(idToken: string, request: SignedCookieRequest, reply: CookieReply) {
    const expectedNonce = this.readNonceCookie(request);
    this.clearNonceCookie(reply);

    if (!expectedNonce) {
      throw new DomainException(new AccessDeniedError());
    }

    let verified: Awaited<ReturnType<GoogleIdTokenService['verifyIdToken']>>;
    try {
      verified = await this.googleIdTokenService.verifyIdToken(idToken, expectedNonce);
    } catch {
      throw new DomainException(new AccessDeniedError());
    }

    if (!verified.emailVerified) {
      throw new DomainException(new AccessDeniedError());
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const provider = await tx.authProvider.findUnique({
        where: {
          provider_providerId: {
            provider: 'google',
            providerId: verified.sub,
          },
        },
        include: {
          user: true,
        },
      });

      if (provider) {
        return this.ensureLoginableUser(tx, provider.user.id);
      }

      const existingUser = await tx.user.findUnique({
        where: {
          email: verified.email,
        },
      });

      if (existingUser) {
        const recoveredUser = await this.ensureLoginableUser(tx, existingUser.id);

        await tx.authProvider.create({
          data: {
            userId: recoveredUser.id,
            provider: 'google',
            providerId: verified.sub,
          },
        });

        return recoveredUser;
      }

      return tx.user.create({
        data: {
          email: verified.email,
          name: verified.name ?? verified.email.split('@')[0] ?? `user-${randomUUID().slice(0, 8)}`,
          avatarUrl: verified.picture,
          role: UserRole.User as DatabaseUserRole,
          status: UserStatus.Active,
          authProviders: {
            create: {
              provider: 'google',
              providerId: verified.sub,
            },
          },
        },
      });
    });

    const client = this.clientContext.client;
    const ua = new UAParser.UAParser(client?.userAgent).getResult();
    const browser = ua.browser.name ?? 'Unknown Browser';
    const os = ua.os.name ?? 'Unknown OS';
    const device = ua.device.model ?? ua.device.type ?? 'Desktop';

    const session = await this.sessionService.createSession({
      userId: user.id,
      userRole: user.role,
      name: `${browser} on ${os}`,
      os,
      device,
      userAgent: client?.userAgent ?? 'unknown',
    });

    this.sessionService.setSessionCookie(reply, session.sessionId);

    return apiOk(200, {
      data: {},
      meta: {},
    });
  }

  async logout(sessionId: string, reply: CookieReply) {
    await this.sessionService.revokeSession(sessionId);
    this.sessionService.clearSessionCookie(reply);

    return apiOk(200, {
      data: {
        success: true as const,
      },
      meta: {},
    });
  }

  private async ensureLoginableUser(tx: Prisma.TransactionClient, userId: string) {
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new DomainException(new AccessDeniedError());
    }

    if (user.status === UserStatus.Banned) {
      throw new DomainException(new AccessDeniedError());
    }

    if (user.status === UserStatus.Deleted) {
      return tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: UserStatus.Active,
          deletedAt: null,
        },
      });
    }

    return user;
  }

  private readNonceCookie(request: SignedCookieRequest) {
    const rawNonce = request.cookies?.[GOOGLE_OAUTH_NONCE_COOKIE];

    if (!rawNonce) {
      return null;
    }

    if (!request.unsignCookie) {
      return rawNonce;
    }

    const unsigned = request.unsignCookie(rawNonce);
    if (!unsigned.valid || !unsigned.value) {
      return null;
    }

    return unsigned.value;
  }

  private clearNonceCookie(reply: CookieReply) {
    reply.clearCookie(GOOGLE_OAUTH_NONCE_COOKIE, {
      path: '/',
      httpOnly: true,
      signed: true,
      sameSite: this.sessionCfg.cookieSameSite,
      secure: this.sessionCfg.cookieSecure,
    });
  }
}
