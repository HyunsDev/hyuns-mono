import { DomainComponentCode } from '@workspace/primitive';

import { LogTypeEnum } from '../log.enums';
import { SystemLogAction, SystemLogData } from '../types/system-log.types';

export const systemLog = (
  domain: DomainComponentCode,
  action: SystemLogAction,
  {
    msg,
    data,
    error,
  }: {
    msg?: string;
    data?: Record<string, unknown>;
    error?: Error | unknown;
  },
): SystemLogData => {
  return {
    type: LogTypeEnum['System'],
    domain,
    action,
    msg: msg || action,
    data,
    error,
  };
};
