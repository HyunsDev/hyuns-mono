import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type DomainEventCode<T extends string = string> = Brand<
  UnitCode<T, 'evt'>,
  'DomainEventCode'
>;
export const asDomainEventCode = <const T extends string>(
  code: ValidateUnitCode<T, 'evt'>,
): DomainEventCode<T> => code as unknown as DomainEventCode<T>;
