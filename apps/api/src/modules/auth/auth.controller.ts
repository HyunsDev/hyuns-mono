import { Controller, Req, Res } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';

import { CurrentSession, Public } from '@workspace/backend-core';
import { contract, SessionData } from '@workspace/contract';

import { AuthService } from './auth.service';

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
  startOAuth(@Res({ passthrough: true }) reply: CookieReply) {
    return tsRestHandler(contract.auth.oauth.start, async ({ body }) => {
      return this.authService.startGoogleOAuth(body.redirectUrl, reply);
    });
  }

  @Public()
  @TsRestHandler(contract.auth.oauth.googleCallback)
  googleCallback(
    @Req() rawRequest: SignedCookieRequest,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    return tsRestHandler(contract.auth.oauth.googleCallback, async ({ body }) => {
      return this.authService.completeGoogleOAuth(body.idToken, rawRequest, reply);
    });
  }

  @TsRestHandler(contract.auth.logout)
  logout(@CurrentSession() session: SessionData, @Res({ passthrough: true }) reply: CookieReply) {
    return tsRestHandler(contract.auth.logout, async () => {
      return this.authService.logout(session.sessionId, reply);
    });
  }
}
