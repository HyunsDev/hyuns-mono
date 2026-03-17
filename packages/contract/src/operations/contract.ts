import { MeRouter } from './me/me.router';

import { c } from '@/internal';

export const contract = c.router({
  me: MeRouter,
});
