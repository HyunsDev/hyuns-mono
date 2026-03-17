import z from 'zod';

import { UserRoleSchema, UserStatusSchema } from './user.enums';

export const UserBaseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  avatarUrl: z.url().nullable(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  adminMemo: z.string().max(500).nullable(),
});
export type UserBase = z.infer<typeof UserBaseSchema>;

export const UserSummarySchema = UserBaseSchema.pick({
  id: true,
  email: true,
  avatarUrl: true,
  role: true,
});
export type UserSummary = z.infer<typeof UserSummarySchema>;
