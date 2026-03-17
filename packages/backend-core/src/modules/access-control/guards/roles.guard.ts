import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '@workspace/contract';

import { AccessDeniedError, DomainException } from '@/common/error';
import { SessionContext } from '@/modules/context';

import { ROLES_KEY } from '../../../common/decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionContext: SessionContext,
  ) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const userRole = this.sessionContext.session?.userRole;

    if (!userRole || !roles.includes(userRole)) {
      throw new DomainException(new AccessDeniedError());
    }

    return true;
  }
}
