import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessDeniedError, DomainException } from '@/common/error';
import { SessionContext } from '@/modules/context';
import { SessionService } from '@/modules/session';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

interface RequestWithSession {
  cookies?: Record<string, string | undefined>;
  session?: ReturnType<SessionService['toSessionData']>;
  unsignCookie?: (value: string) => { valid: boolean; value: string | null };
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService,
    private readonly sessionContext: SessionContext,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session = await this.sessionService.getRequestSession(request);

    if (!session) {
      throw new DomainException(new AccessDeniedError());
    }

    const sessionData = this.sessionService.toSessionData(session);
    this.sessionContext.setSession(sessionData);
    (request as RequestWithSession).session = sessionData;

    return true;
  }
}
