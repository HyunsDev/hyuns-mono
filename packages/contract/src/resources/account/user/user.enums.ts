import { z } from 'zod';

import type { ValueOf } from '@workspace/shared';

export const UserRole = {
  Guest: 'guest',
  bot: 'bot',
  User: 'user',
  Admin: 'admin',
} as const;
export type UserRole = ValueOf<typeof UserRole>;
export const UserRoleSchema = z.enum(UserRole);

export const UserStatus = {
  Active: 'active',
  Banned: 'banned',
  Deleted: 'deleted',
} as const;
export type UserStatus = ValueOf<typeof UserStatus>;
export const UserStatusSchema = z.enum(UserStatus);
