import { initContract } from '@ts-rest/core';
import z from 'zod';

import {
  createOffsetPaginationQuerySchema,
  OffsetPaginationMetaSchema,
} from './offset-pagination/offset-pagination.schema';
import { createErrorResponseSchemas, createOkResponseSchema } from './response';
import { createSortQuerySchema } from './sort/sort.schema';

/**
 * ts-rest contract 인스턴스입니다.
 */
export const c: ReturnType<typeof initContract> = initContract();

/**
 * 목록 응답에서 쓰이는 기본 사용자 스키마입니다.
 */
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
});

/**
 * 사용자 목록 조회 계약 예시입니다.
 *
 * - offset 페이지네이션 쿼리(`page`, `limit`)
 * - 정렬(`sort`)
 * - 성공 응답 `{ data, meta }`
 * - 실패 응답 목록
 */
export const ListUser = c.query({
  method: 'GET',
  path: '/users',
  query: z.object({
    name: z.string().optional(),
    ...createOffsetPaginationQuerySchema().shape,
    ...createSortQuerySchema(['name', 'createdAt']).shape,
  }),
  responses: {
    ...createOkResponseSchema({
      data: UserSchema.array(),
      meta: z.object({
        ...OffsetPaginationMetaSchema.shape,
      }),
    }),
    ...createErrorResponseSchemas([]),
  },
});
