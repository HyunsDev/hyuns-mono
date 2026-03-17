import z from 'zod';

import { createOkResponseSchema } from '@workspace/shared';

import { AuthOAuthRouter } from './oauth/oauth.router';

import { c } from '@/internal';

export const AuthRouter = c.router({
  oauth: AuthOAuthRouter,

  logout: c.mutation({
    summary: '로그아웃',
    description: 'Logs out the currently authenticated user.',
    method: 'POST',
    path: '/auth/logout',
    body: c.noBody(),
    responses: {
      ...createOkResponseSchema({
        data: z.object({
          success: z.literal(true),
        }),
      }),
    },
  }),
});
