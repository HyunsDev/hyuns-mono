import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { SessionData } from '@workspace/contract';

interface SessionRequest {
  session?: SessionData;
}

export const CurrentSession = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<SessionRequest>();
  return request.session;
});
