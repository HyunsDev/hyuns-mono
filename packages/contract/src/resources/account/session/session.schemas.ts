import z from 'zod';

export const SessionBaseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  os: z.string(),
  device: z.string(),
  userAgent: z.string(),
  isRevoked: z.boolean(),
  revokedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});
export type SessionBase = z.infer<typeof SessionBaseSchema>;
