import z from 'zod';

export const createOkResultSchema = <
  const TData extends z.ZodObject | z.ZodArray,
  const TMeta extends z.ZodType,
>({
  data,
  meta,
}: {
  data: TData;
  meta?: TMeta | undefined;
}) =>
  z.object({
    data,
    meta: meta ?? z.object({}),
  });

export type OkResult<
  TData extends Record<string, unknown> = Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>,
> = {
  data: TData;
  meta: TMeta;
};

/**
 * 성공 응답(200) 스키마를 간단히 생성합니다.
 *
 * @param data 응답 본문 필드인 `data`에 들어갈 zod 스키마
 * @param meta optional `meta` 필드 스키마
 * @returns `{ 200: { data, meta? } }` 형태의 ts-rest 응답 정의
 */
export const createOkResponseSchema = <
  const TData extends z.ZodObject | z.ZodArray,
  const TMeta extends z.ZodType,
>({
  data,
  meta,
}: {
  data: TData;
  meta?: TMeta | undefined;
}) =>
  ({
    200: createOkResultSchema({ data, meta: meta }),
  }) as const;

export type OkResponse<
  TData extends Record<string, unknown> = Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>,
> = {
  200: OkResult<TData, TMeta>;
};
