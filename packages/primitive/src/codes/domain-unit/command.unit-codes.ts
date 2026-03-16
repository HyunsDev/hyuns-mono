import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type CommandCode<T extends string = string> = Brand<UnitCode<T, 'cmd'>, 'CommandCode'>;
export const asCommandCode = <const T extends string>(
  code: ValidateUnitCode<T, 'cmd'>,
): CommandCode<T> => code as unknown as CommandCode<T>;
