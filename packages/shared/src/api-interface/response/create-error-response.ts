import { z } from 'zod';

import type { ApiError } from '@/api-error';

/**
 * 에러 응답 맵 타입을 API 에러 정의에 맞게 생성합니다.
 *
 * @example
 * type ApiErrors = ErrorResponseMap<typeof ERRORS[number]>;
 */
export type ErrorResponseMap<T extends ApiError> = {
  [K in T['status']]: z.ZodType<{
    status: K;
    code: Extract<T, { status: K }>['code'];
    message: string;
    details?: unknown;
  }>;
};

/**
 * 단일 ApiError를 ts-rest 응답용 zod 스키마로 변환합니다.
 *
 * @param exception ApiError 항목
 * @returns `{ status, code, message, details? }` 형태 스키마
 */
export const toApiErrorResponse = <const T extends ApiError>(exception: T) => {
  return z.object({
    status: z.literal(exception.status),
    code: z.literal(exception.code),
    message: z.literal(exception.message),
    details: z.any().optional(),
  });
};

/**
 * ApiError 배열을 상태코드별 ts-rest 응답 스키마 객체로 변환합니다.
 *
 * - 같은 status가 여러 개면 `discriminatedUnion('code', ...)`으로 병합합니다.
 * - 단일이면 해당 코드의 스키마를 그대로 노출합니다.
 *
 * @param exceptions ApiError 배열
 * @returns status를 키로 가지는 zod 응답 맵
 */
export const createErrorResponseSchemas = <const T extends readonly ApiError[]>(exceptions: T) => {
  const grouped = exceptions.reduce(
    (acc, ex) => {
      const { status } = ex;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(toApiErrorResponse(ex));
      return acc;
    },
    {} as Record<number, z.ZodType[]>,
  );

  const responses: Record<number, z.ZodType> = {};

  Object.entries(grouped).forEach(([statusStr, schemas]) => {
    const status = Number(statusStr);
    if (schemas.length === 1) {
      responses[status] = schemas[0] as z.ZodType;
    } else {
      responses[status] = z.discriminatedUnion('code', schemas as [z.ZodObject, ...z.ZodObject[]]);
    }
  });
  return responses as unknown as ErrorResponseMap<T[number]>;
};
