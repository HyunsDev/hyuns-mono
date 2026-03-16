import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type StoreCodeType = 'sto';
export type StoreCode<T extends string = string> = Brand<UnitCode<T, 'sto'>, 'StoreCode'>;
export const asStoreCode = <const T extends string>(
  code: ValidateUnitCode<T, 'sto'>,
): StoreCode<T> => code as unknown as StoreCode<T>;
