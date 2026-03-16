import { DomainComponentCode } from '@workspace/primitive';

import { BaseLogData } from './base-log.types';
import { LogTypeEnum } from '../log.enums';

export interface DomainLogData extends BaseLogData {
  type: LogTypeEnum['Domain'];
  domain: DomainComponentCode;
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}
