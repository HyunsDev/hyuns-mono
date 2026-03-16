import z from 'zod';

/** @public - offset 기반 페이지네이션 쿼리 생성에 사용하는 옵션입니다. */
export interface OffsetPaginationOptions {
  /** 허용할 수 있는 최대 개수입니다. */
  maxLimit?: number;
  /** 기본 응답 개수입니다. */
  defaultLimit?: number;
}

/**
 * offset 기반 페이지네이션용 쿼리 스키마를 생성합니다.
 *
 * @param options 기본값과 개수 제한을 커스터마이징할 수 있습니다.
 * @returns `{ page, limit }`를 포함한 zod 객체 스키마
 */
export function createOffsetPaginationQuerySchema(options: OffsetPaginationOptions = {}) {
  const { maxLimit = 100, defaultLimit = 20 } = options;

  return z.object({
    page: z.coerce.number().int().min(1).prefault(1),
    limit: z.coerce.number().int().min(1).max(maxLimit).prefault(defaultLimit),
  });
}

/** @public - `createOffsetPaginationQuerySchema`의 타입 파생형입니다. */
export type OffsetPaginationQuery = z.infer<ReturnType<typeof createOffsetPaginationQuerySchema>>;

/** @public - offset 페이지네이션 응답 메타데이터 스키마입니다. */
export const OffsetPaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPage: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

/** @public - `OffsetPaginationMetaSchema`의 타입 파생형입니다. */
export type OffsetPaginationMeta = z.infer<typeof OffsetPaginationMetaSchema>;
