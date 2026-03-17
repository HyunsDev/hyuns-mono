import { SetMetadata } from '@nestjs/common';

import { UserRole } from '@workspace/contract';

export const ROLES_KEY = Symbol('ROLES_KEY');

export const Role = (...rolesOrSingleArray: [UserRole[]] | UserRole[]) => {
  const roles = Array.isArray(rolesOrSingleArray[0])
    ? (rolesOrSingleArray[0] as UserRole[])
    : (rolesOrSingleArray as UserRole[]);

  return SetMetadata(ROLES_KEY, roles);
};
