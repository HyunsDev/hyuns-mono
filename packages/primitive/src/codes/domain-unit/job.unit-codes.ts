import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type JobCode<T extends string = string> = Brand<UnitCode<T, 'job'>, 'JobCode'>;
export const asJobCode = <const T extends string>(code: ValidateUnitCode<T, 'job'>): JobCode<T> =>
  code as unknown as JobCode<T>;
