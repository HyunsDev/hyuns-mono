import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type TaskQueueCode<T extends string = string> = Brand<UnitCode<T, 'que'>, 'TaskQueueCode'>;
export const asTaskQueueCode = <const T extends string>(
  code: ValidateUnitCode<T, 'que'>,
): TaskQueueCode<T> => code as unknown as TaskQueueCode<T>;
