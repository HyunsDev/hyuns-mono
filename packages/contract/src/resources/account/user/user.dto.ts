import { UserBaseSchema } from './user.schemas';

import type z from 'zod';

export const UserDtoSchema = UserBaseSchema.pick({
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
});
export type UserDto = z.infer<typeof UserDtoSchema>;

export const UserDetailDtoSchema = UserBaseSchema;
export type UserDetailDto = z.infer<typeof UserDetailDtoSchema>;
