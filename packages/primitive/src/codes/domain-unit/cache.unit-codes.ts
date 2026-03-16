import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type CacheCode<T extends string = string> = Brand<UnitCode<T, 'cac'>, 'CacheCode'>;
export const asCacheCode = <const T extends string>(
  code: ValidateUnitCode<T, 'cac'>,
): CacheCode<T> => code as unknown as CacheCode<T>;
