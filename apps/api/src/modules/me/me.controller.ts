import { Controller, Req, Res } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';

import { CurrentSession, apiErr, apiOk, Role, SessionService } from '@workspace/backend-core';
import { contract, SessionData, UserRole } from '@workspace/contract';

import { toUserDto } from '../common/user.mapper';

import { MeService } from './me.service';

interface CookieReply {
  clearCookie: (name: string, options?: Record<string, unknown>) => void;
  setCookie: (name: string, value: string, options?: Record<string, unknown>) => void;
}

interface MultipartRequest {
  body?: {
    file?: {
      filename?: string;
      mimetype?: string;
      toBuffer?: () => Promise<Buffer>;
    };
  };
}

@Controller()
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly sessionService: SessionService,
  ) {}

  @TsRestHandler(contract.me.get)
  getMe(@CurrentSession() session: SessionData) {
    return tsRestHandler(contract.me.get, async () => {
      const user = await this.meService.getCurrentUser(session.userId);

      return apiOk(200, {
        data: toUserDto(user),
        meta: {},
      });
    });
  }

  @Role([UserRole.User, UserRole.Admin])
  @TsRestHandler(contract.me.updateProfile)
  updateProfile(@CurrentSession() session: SessionData) {
    return tsRestHandler(contract.me.updateProfile, async ({ body }) => {
      const user = await this.meService.updateProfile(session.userId, body.name);

      return apiOk(200, {
        data: toUserDto(user),
        meta: {},
      });
    });
  }

  @Role([UserRole.User, UserRole.Admin])
  @TsRestHandler(contract.me.updateAvatar)
  updateAvatar(@CurrentSession() session: SessionData, @Req() rawRequest: MultipartRequest) {
    return tsRestHandler(contract.me.updateAvatar, async () => {
      const result = await this.meService.updateAvatar(session.userId, rawRequest.body?.file ?? {});

      if ('error' in result) {
        return apiErr(result.error!);
      }

      return apiOk(200, {
        data: toUserDto(result.user),
        meta: {},
      });
    });
  }

  @Role([UserRole.User, UserRole.Admin])
  @TsRestHandler(contract.me.delete)
  deleteMe(@CurrentSession() session: SessionData, @Res({ passthrough: true }) reply: CookieReply) {
    return tsRestHandler(contract.me.delete, async () => {
      const result = await this.meService.deleteAccount(session.userId);

      if ('error' in result) {
        return apiErr(result.error!);
      }

      this.sessionService.clearSessionCookie(reply);

      return apiOk(200, {
        data: toUserDto(result.user),
        meta: {},
      });
    });
  }

  @Role([UserRole.User, UserRole.Admin])
  @TsRestHandler(contract.me.sessions.list)
  listSessions(@CurrentSession() session: SessionData) {
    return tsRestHandler(contract.me.sessions.list, async () => {
      const sessions = await this.meService.listSessions(session.userId, session.sessionId);

      return {
        status: 200 as const,
        body: {
          data: sessions,
          meta: {},
        },
      };
    });
  }

  @Role([UserRole.User, UserRole.Admin])
  @TsRestHandler(contract.me.sessions.delete)
  deleteSession(@CurrentSession() session: SessionData) {
    return tsRestHandler(contract.me.sessions.delete, async ({ params }) => {
      const result = await this.meService.deleteSession(
        session.userId,
        session.sessionId,
        params.sessionId,
      );

      if ('error' in result) {
        return apiErr(result.error!);
      }

      return apiOk(200, {
        data: {
          success: result.success,
        },
        meta: {},
      });
    });
  }
}
