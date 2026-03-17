import z from 'zod';

import { createOkResponseSchema } from '@workspace/shared';

import { c } from '@/internal';

export const AuthOAuthRouter = c.router({
  start: c.mutation({
    summary: 'OAuth를 이용한 로그인을 시작합니다',
    description: 'Initiates the OAuth login process by providing the authorization URL.',
    method: 'POST',
    path: '/auth/oauth/start',
    body: z.object({
      provider: z.enum(['google']),
      redirectUrl: z.url(),
    }),
    responses: {
      ...createOkResponseSchema({
        data: z.object({
          authorizationUrl: z.string(),
        }),
      }),
    },
  }),

  googleCallback: c.mutation({
    summary: 'Google OAuth 로그인 콜백을 처리합니다',
    description: 'Handles the callback from Google OAuth and returns an access token.',
    method: 'POST',
    path: '/auth/oauth/google/callback',
    body: z.object({
      idToken: z.string(),
    }),
    responses: {
      ...createOkResponseSchema({
        data: z.object({}),
      }),
    },
  }),
});
