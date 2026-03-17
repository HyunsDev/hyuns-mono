import z from 'zod';

import { UserRoleSchema } from '../user';

export const SessionBaseSchema = z.object({
  sessionId: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  os: z.string(),
  device: z.string(),
  userAgent: z.string(),
  createdAt: z.iso.datetime(),
  isCurrent: z.boolean(),
});
export type SessionBase = z.infer<typeof SessionBaseSchema>;

export const SessionDataSchema = z.object({
  sessionId: z.uuid(),
  userId: z.uuid(),
  userRole: UserRoleSchema,
  createdAt: z.iso.datetime(),
});
export type SessionData = z.infer<typeof SessionDataSchema>;
