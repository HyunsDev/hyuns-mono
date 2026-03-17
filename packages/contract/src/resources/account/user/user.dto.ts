import { UserBaseSchema } from './user.schemas';

import type z from 'zod';

export const UserDto = UserBaseSchema.pick({
  id: true,
  email: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
});
export type UserDto = z.infer<typeof UserDto>;

export const UserDetailDto = UserBaseSchema;
export type UserDetailDto = z.infer<typeof UserDetailDto>;
