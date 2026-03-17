import { Controller, Req, Res } from '@nestjs/common';
import { ServerInferRequest } from '@ts-rest/core';
import { TsRestHandler, TsRestRequest } from '@ts-rest/nest';

import { CurrentSession, apiErr, apiOk, Role, SessionService } from '@workspace/backend-core';
import { contract, SessionData, UserRole } from '@workspace/contract';

import { toUserDto } from '../common/user.mapper';

import { MeService } from './me.service';

type UpdateProfileRequest = ServerInferRequest<typeof contract.me.updateProfile>;
type UpdateAvatarRequest = ServerInferRequest<typeof contract.me.updateAvatar>;

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
  async getMe(@CurrentSession() session: SessionData) {
    const user = await this.meService.getCurrentUser(session.userId);

    return apiOk(200, {
      data: toUserDto(user),
      meta: {},
    });
  }

  @Role([UserRole.User, UserRole.Admin])
  @TsRestHandler(contract.me.updateProfile)
  async updateProfile(
    @CurrentSession() session: SessionData,
    @TsRestRequest() request: UpdateProfileRequest,
  ) {
    const user = await this.meService.updateProfile(session.userId, request.body.name);

    return apiOk(200, {
      data: toUserDto(user),
      meta: {},
    });
  }

  @Role([UserRole.User, UserRole.Admin])
  @TsRestHandler(contract.me.updateAvatar)
  async updateAvatar(
    @CurrentSession() session: SessionData,
    @TsRestRequest() request: UpdateAvatarRequest,
    @Req() rawRequest: MultipartRequest,
  ) {
    const result = await this.meService.updateAvatar(
      session.userId,
      rawRequest.body?.file ?? (request.body as never),
    );

    if ('error' in result) {
      return apiErr(result.error!);
    }

    return apiOk(200, {
      data: toUserDto(result.user),
      meta: {},
    });
  }

  @Role([UserRole.User, UserRole.Admin])
  @TsRestHandler(contract.me.delete)
  async deleteMe(
    @CurrentSession() session: SessionData,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    const result = await this.meService.deleteAccount(session.userId);

    if ('error' in result) {
      return apiErr(result.error!);
    }

    this.sessionService.clearSessionCookie(reply);

    return apiOk(200, {
      data: toUserDto(result.user),
      meta: {},
    });
  }
}
