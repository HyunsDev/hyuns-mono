import { z } from 'zod';

export const UserRole = {
  User: 'user',
  Manager: 'manager',
  Admin: 'admin',
} as const;
export const UserRoleSchema = z.enum(UserRole);
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
