import { AuthRouter } from './auth/auth.router';
import { MeRouter } from './me/me.router';

import { c } from '@/internal';

export const contract = c.router({
  me: MeRouter,
  auth: AuthRouter,
});
