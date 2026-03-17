import { Controller, Req, Res } from '@nestjs/common';
import { ServerInferRequest } from '@ts-rest/core';
import { TsRestHandler, TsRestRequest } from '@ts-rest/nest';

import { CurrentSession, Public } from '@workspace/backend-core';
import { contract, SessionData } from '@workspace/contract';

import { AuthService } from './auth.service';

type OAuthStartRequest = ServerInferRequest<typeof contract.auth.oauth.start>;
type GoogleCallbackRequest = ServerInferRequest<typeof contract.auth.oauth.googleCallback>;

interface CookieReply {
  clearCookie: (name: string, options?: Record<string, unknown>) => void;
  setCookie: (name: string, value: string, options?: Record<string, unknown>) => void;
}

interface SignedCookieRequest {
  cookies: Record<string, string | undefined>;
  unsignCookie?: (value: string) => { valid: boolean; value: string | null };
}

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @TsRestHandler(contract.auth.oauth.start)
  async startOAuth(
    @TsRestRequest() request: OAuthStartRequest,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    return this.authService.startGoogleOAuth(request.body.redirectUrl, reply);
  }

  @Public()
  @TsRestHandler(contract.auth.oauth.googleCallback)
  async googleCallback(
    @TsRestRequest() request: GoogleCallbackRequest,
    @Req() rawRequest: SignedCookieRequest,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    return this.authService.completeGoogleOAuth(request.body.idToken, rawRequest, reply);
  }

  @TsRestHandler(contract.auth.logout)
  async logout(
    @CurrentSession() session: SessionData,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    return this.authService.logout(session.sessionId, reply);
  }
}
