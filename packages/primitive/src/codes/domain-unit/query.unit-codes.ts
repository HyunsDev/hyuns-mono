import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type QueryCode<T extends string = string> = Brand<UnitCode<T, 'qry'>, 'QueryCode'>;
export const asQueryCode = <const T extends string>(
  code: ValidateUnitCode<T, 'qry'>,
): QueryCode<T> => code as unknown as QueryCode<T>;
