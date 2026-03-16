import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AccessTokenPayload } from '@workspace/primitive';

export const Token = createParamDecorator(
  (data: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AccessTokenPayload;
    if (!user) return null;
    return data ? user[data] : user;
  },
);
