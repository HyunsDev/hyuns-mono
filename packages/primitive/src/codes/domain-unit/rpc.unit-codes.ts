import type { UnitCode, ValidateUnitCode } from '../../utils/unit-code.utils';
import type { Brand } from '@/utils/brand.type';

export type RpcCode<T extends string = string> = Brand<UnitCode<T, 'rpc'>, 'RpcCode'>;
export const asRpcCode = <const T extends string>(code: ValidateUnitCode<T, 'rpc'>): RpcCode<T> =>
  code as unknown as RpcCode<T>;
