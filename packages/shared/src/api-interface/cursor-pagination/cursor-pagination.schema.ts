import z from 'zod';

/** @public - cursor 기반 페이지네이션 쿼리 생성 시 사용하는 옵션입니다. */
export interface CursorPaginationOptions {
  /** 기본 응답 개수입니다. */
  defaultLimit?: number;
  /** 허용할 수 있는 최대 개수입니다. */
  maxLimit?: number;
}

/**
 * cursor 기반 페이지네이션용 쿼리 스키마를 생성합니다.
 *
 * @param options 기본값과 개수 제한 등을 조정할 수 있습니다.
 * @returns `{ limit, cursor }`를 포함한 zod 객체 스키마
 */
export function createCursorPaginationQuerySchema(options: CursorPaginationOptions = {}) {
  const { defaultLimit = 20, maxLimit = 100 } = options;

  return z.object({
    limit: z.coerce.number().int().min(1).max(maxLimit).prefault(defaultLimit),
    cursor: z.string().optional(),
  });
}

/** @public - `createCursorPaginationQuerySchema`의 타입 파생형입니다. */
export type CursorPaginationQuery = z.infer<ReturnType<typeof createCursorPaginationQuerySchema>>;

/** @public - cursor 페이지네이션 응답 메타데이터 스키마입니다. */
export const CursorPaginationMetaSchema = z.object({
  nextCursor: z.string().nullable(),
  limit: z.number(),
});

/** @public - `CursorPaginationMetaSchema`의 타입 파생형입니다. */
export type CursorPaginationMeta = z.infer<typeof CursorPaginationMetaSchema>;
