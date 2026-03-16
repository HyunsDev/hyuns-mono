import z from 'zod';

/**
 * 정렬 키 목록으로 `sort` 쿼리 스키마를 생성합니다.
 *
 * @param keys 허용할 정렬 필드 목록
 * @returns `{ sort?: string }` 형태의 zod 객체 스키마
 */
export function createSortQuerySchema<const T extends string>(keys: T[]) {
  return z.object({
    sort: z.enum(keys).optional(),
  });
}

export type SortQuery<T extends string> = z.infer<ReturnType<typeof createSortQuerySchema<T>>>;
