import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type IntegrationEventCode<T extends string = string> = Brand<
  UnitCode<T, 'pub'>,
  'IntegrationEventCode'
>;
export const asIntegrationEventCode = <const T extends string>(
  code: ValidateUnitCode<T, 'pub'>,
): IntegrationEventCode<T> => code as unknown as IntegrationEventCode<T>;
