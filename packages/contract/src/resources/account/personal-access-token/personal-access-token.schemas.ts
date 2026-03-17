import z from 'zod';

export const PersonalAccessTokenBaseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  lastUsedAt: z.iso.datetime().nullable(),
  expireAt: z.iso.datetime().nullable(),
  revoked: z.boolean(),
  revokedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});
export type PersonalAccessTokenBase = z.infer<typeof PersonalAccessTokenBaseSchema>;
