import { z } from 'zod';

import { SessionIdSchema, UserIdSchema } from '@/ids';

export const RefreshTokenPayloadSchema = z.object({
  iss: z.literal('typebook.io'),
  sub: UserIdSchema,
  sid: SessionIdSchema,
  jti: z.uuid(),
  type: z.literal('refresh'),
});

export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;
