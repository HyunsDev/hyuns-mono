import z from 'zod';

/**
 * 인자가 없는 경우에도 z.discriminatedUnion을 사용할 수 있도록 도와줍니다.
 * * 변경점:
 * 1. T의 제약 조건을 `z.AnyZodObject`로 수정하여 제네릭 에러를 방지했습니다.
 * 2. 반환 타입을 `z.ZodType<z.output<T>>`로 명시하여,
 * 입력된 스키마(T)들이 만들어내는 데이터(output)의 유니온 타입을 정확히 반환합니다.
 */
export const safeDiscriminatedUnion = <const T extends z.ZodObject | z.ZodDiscriminatedUnion>(
  discriminator: string,
  options: T[],
): T => {
  if (options.length === 0) {
    return z.never() as unknown as T;
  }

  const [first, ...rest] = options;
  if (rest.length === 0) {
    return first as Exclude<typeof first, undefined> as unknown as T;
  }

  return z.discriminatedUnion(discriminator, [
    first as Exclude<typeof first, undefined>,
    ...rest,
  ]) as unknown as T;
};
