import { SessionBaseSchema } from './session.schemas';

import type z from 'zod';

export const SessionDetailDtoSchema = SessionBaseSchema;
export type SessionDetailDto = z.infer<typeof SessionDetailDtoSchema>;
