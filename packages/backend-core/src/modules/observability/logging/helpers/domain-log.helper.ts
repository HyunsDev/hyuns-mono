import { DomainComponentCode } from '@workspace/primitive';

import { LogTypeEnum } from '../log.enums';
import { DomainLogData } from '../types/domain-log.types';

export const domainLog = (
  domain: DomainComponentCode,
  code: string,
  {
    msg,
    data,
  }: {
    msg?: string;
    data: Record<string, unknown>;
  },
): DomainLogData => {
  return {
    type: LogTypeEnum['Domain'],
    domain,
    code,
    msg: msg || code,
    data,
  };
};
