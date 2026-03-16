import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export const ChangeAction = {
  Create: 'create' as const,
  Patch: 'patch' as const,
  Replace: 'replace' as const,
  Delete: 'delete' as const,
} as const;
export type ChangeAction = (typeof ChangeAction)[keyof typeof ChangeAction];

export type ChangeCode<T extends string = string> = Brand<
  UnitCode<T, 'chg', ChangeAction>,
  'ChangeCode'
>;
export const asChangeCode = <const T extends string>(
  code: ValidateUnitCode<T, 'chg', ChangeAction>,
): ChangeCode<T> => code as unknown as ChangeCode<T>;
