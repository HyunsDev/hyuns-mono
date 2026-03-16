import { z } from 'zod';

import { UserRoleSchema } from './user-role.schema';

import { SessionIdSchema, UserIdSchema } from '@/ids';

export const AccessTokenPayloadSchema = z.object({
  iss: z.literal('hyuns.dev'),
  sub: UserIdSchema,
  role: UserRoleSchema,
  sid: SessionIdSchema,
  type: z.literal('access'),
});

export type AccessTokenPayload = z.infer<typeof AccessTokenPayloadSchema>;
