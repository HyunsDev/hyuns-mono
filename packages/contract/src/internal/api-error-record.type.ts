import type { ApiError } from '@workspace/shared';

// T 내의 다른 키들이 가진 code들의 Union을 추출하는 타입
type OtherCodesInRecord<T, K extends keyof T> = {
  [P in keyof T]: P extends K
    ? never // 자기 자신 제외
    : T[P] extends { code: infer C }
      ? C
      : never;
}[keyof T];

// 그룹 내에서 중복된 code가 있는지 검사하는 타입
type ValidateLocalUnique<T> = {
  [K in keyof T]: T[K] extends { code: infer CurrentCode }
    ? CurrentCode extends OtherCodesInRecord<T, K>
      ? {
          // 🚨 에러 발생 시 타입 형태를 망가뜨려 할당을 막고 메시지를 띄움
          status: number;
          code: `🚨 DUPLICATE_IN_RECORD: ${CurrentCode & string} 🚨`;
          message: string;
        }
      : T[K]
    : never;
};

export const defineApiErrors = <T extends Record<string, ApiError>>(
  errors: T & ValidateLocalUnique<T>,
): T => errors;
