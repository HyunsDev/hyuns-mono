# `packages/shared/src/api`

이 폴더는 `ts-rest` API 계약(contract) 작성을 일관되게 만들기 위한 공통 유틸 모음입니다.  
페이지네이션, 정렬, 응답 포맷, 에러 응답을 표준 형태로 재사용할 수 있도록 구성되어 있습니다.

## Public Export

- `cursor-pagination/*`
  - `createCursorPaginationQuerySchema(options?)`
  - `CursorPaginationOptions`
  - `CursorPaginationQuery`
  - `CursorPaginationMetaSchema`
  - `CursorPaginationMeta`
- `offset-pagination/*`
  - `createOffsetPaginationQuerySchema(options?)`
  - `OffsetPaginationOptions`
  - `OffsetPaginationQuery`
  - `OffsetPaginationMetaSchema`
  - `OffsetPaginationMeta`
- `sort/*`
  - `createSortQuerySchema(keys)`
- `response/*`
  - `createOkResponse({ data, meta? })`
  - `createErrorResponses(exceptions)`
  - `toApiErrorResponse(exception)`
  - `ErrorResponseMap<T>`
- `index.ts`
  - `export * from './cursor-pagination'`
  - `export * from './offset-pagination'`
  - `export * from './response'`
  - `export * from './sort'`

상위 레벨 `packages/shared/src/index.ts`에서 `export * from './api'`를 연결해
실서비스에서는 `@workspace/shared` 엔트리 포인트로 바로 가져와 사용할 수 있습니다.

## 사용 예시 (`play.ts` 기반)

`play.ts`는 리스트 조회 계약을 작성한 예시입니다.

```ts
import { initContract } from '@ts-rest/core';
import z from 'zod';

import {
  createOffsetPaginationQuerySchema,
  createErrorResponses,
  createOkResponse,
  createSortQuerySchema,
  OffsetPaginationMetaSchema,
} from '@workspace/shared';

export const c: ReturnType<typeof initContract> = initContract();

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
});

export const ListUser = c.query({
  method: 'GET',
  path: '/users',
  query: z.object({
    name: z.string().optional(),
    ...createOffsetPaginationQuerySchema().shape,
    ...createSortQuerySchema(['name', 'createdAt']).shape,
  }),
  responses: {
    ...createOkResponse({
      data: UserSchema.array(),
      meta: z.object({
        ...OffsetPaginationMetaSchema.shape,
      }),
    }),
    ...createErrorResponses([]),
  },
});
```

### 추천 작성 패턴

1. 계약 파일에서 `initContract()`를 한 번만 만들고 재사용한다.
2. 공통 스키마(`createOffsetPaginationQuerySchema`, `createSortQuerySchema`)를 `...` spread로 조합한다.
3. 성공 응답은 `createOkResponse`로 통일하고, 공통 에러는 `createErrorResponses`로 통일한다.
