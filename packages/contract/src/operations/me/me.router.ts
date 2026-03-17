import z from 'zod';

import { createErrorResponseSchemas, createOkResponseSchema } from '@workspace/shared';

import { c } from '@/internal';
import { ApiErrors } from '@/resources';
import { SessionDetailDtoSchema, UserBaseSchema, UserDtoSchema, UserRole } from '@/resources/account';

export const MeRouter = c.router({
  get: c.query({
    summary: '로그인한 유저의 프로필을 가져옵니다',
    description: 'Returns the profile of the currently authenticated user.',
    method: 'GET',
    path: '/me',
    responses: {
      ...createOkResponseSchema({
        data: UserDtoSchema,
      }),
    },
  }),

  updateProfile: c.mutation({
    summary: '로그인한 유저의 프로필을 업데이트합니다',
    description: 'Updates the profile of the currently authenticated user.',
    method: 'PATCH',
    path: '/me/profile',
    body: z.object({
      name: UserBaseSchema.shape.name.optional(),
    }),
    responses: {
      ...createOkResponseSchema({
        data: UserDtoSchema,
      }),
    },
    metadata: {
      roles: [UserRole.User, UserRole.Admin],
    },
  }),

  updateAvatar: c.mutation({
    summary: '로그인한 유저의 아바타를 업데이트합니다',
    description: 'Updates the avatar of the currently authenticated user.',
    method: 'PUT',
    path: '/me/avatar',
    contentType: 'multipart/form-data',
    body: z.object({
      file: z.custom<File>(),
    }),
    responses: {
      ...createOkResponseSchema({
        data: UserDtoSchema,
      }),
      ...createErrorResponseSchemas([ApiErrors.InvalidProfileImage]),
    },
    metadata: {
      roles: [UserRole.User, UserRole.Admin],
    },
  }),

  delete: c.mutation({
    summary: '로그인한 유저의 계정을 삭제합니다',
    description: 'Deletes the account of the currently authenticated user.',
    method: 'DELETE',
    path: '/me',
    body: c.noBody(),
    responses: {
      ...createOkResponseSchema({
        data: UserDtoSchema,
      }),
      ...createErrorResponseSchemas([ApiErrors.UserNotFound, ApiErrors.AdminCannotBeDeleted]),
    },
    metadata: {
      roles: [UserRole.User, UserRole.Admin],
    },
  }),

  sessions: c.router({
    list: c.query({
      summary: '로그인한 유저의 활성 세션 목록을 가져옵니다',
      description: 'Returns the active sessions of the currently authenticated user.',
      method: 'GET',
      path: '/me/sessions',
      responses: {
        ...createOkResponseSchema({
          data: z.array(SessionDetailDtoSchema),
        }),
      },
      metadata: {
        roles: [UserRole.User, UserRole.Admin],
      },
    }),

    delete: c.mutation({
      summary: '로그인한 유저의 특정 세션을 종료합니다',
      description: 'Deletes a specific active session of the currently authenticated user.',
      method: 'DELETE',
      path: '/me/sessions/:sessionId',
      pathParams: z.object({
        sessionId: z.uuid(),
      }),
      body: c.noBody(),
      responses: {
        ...createOkResponseSchema({
          data: z.object({
            success: z.literal(true),
          }),
        }),
        ...createErrorResponseSchemas([
          ApiErrors.SessionNotFound,
          ApiErrors.CurrentSessionCannotBeDeleted,
        ]),
      },
      metadata: {
        roles: [UserRole.User, UserRole.Admin],
      },
    }),
  }),
});
