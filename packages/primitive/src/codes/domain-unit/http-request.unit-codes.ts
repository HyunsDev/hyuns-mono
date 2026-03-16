import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type HttpRequestCode<T extends string = string> = Brand<
  UnitCode<T, 'web'>,
  'HttpRequestCode'
>;
export const asHttpRequestCode = <const T extends string>(
  code: ValidateUnitCode<T, 'web'>,
): HttpRequestCode<T> => code as unknown as HttpRequestCode<T>;
