import { PersonalAccessTokenBaseSchema } from './personal-access-token.schemas';

import type z from 'zod';

export const PersonalAccessTokenDto = PersonalAccessTokenBaseSchema.pick({
  id: true,
  name: true,
  description: true,
  lastUsedAt: true,
  expireAt: true,
  revoked: true,
  revokedAt: true,
  createdAt: true,
});
export type PersonalAccessTokenDto = z.infer<typeof PersonalAccessTokenDto>;

export const PersonalAccessTokenDetailDto = PersonalAccessTokenBaseSchema;
export type PersonalAccessTokenDetailDto = z.infer<typeof PersonalAccessTokenDetailDto>;
