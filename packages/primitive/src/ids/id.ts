import z from 'zod';

import type { CoreIdUnion } from './core.ids';
import type { DomainIdUnion } from './domains';

export type Id = CoreIdUnion | DomainIdUnion;
export const IdSchema = z.string() as unknown as z.ZodType<Id>;
