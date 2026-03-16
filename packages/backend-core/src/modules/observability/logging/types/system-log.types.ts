import { DomainComponentCode } from '@workspace/primitive';

import { BaseLogData } from './base-log.types';
import { LogTypeEnum } from '../log.enums';

export const SystemLogActionEnum = {
  AppInitialize: 'app_initialize',
  InvariantViolation: 'invariant_violation',
  ExternalCallFailed: 'external_call_failed',
  ResourceExhausted: 'resource_exhausted',
  InternalError: 'internal_error',

  PrismaError: 'prisma_error',
  RedisError: 'redis_error',

  UnknownError: 'unknown_error',

  // Devtools
  DevtoolsUsage: 'devtools_usage',

  // Test
  Test: 'test',
} as const;
export type SystemLogAction = (typeof SystemLogActionEnum)[keyof typeof SystemLogActionEnum];

export interface SystemLogData extends BaseLogData {
  type: LogTypeEnum['System'];
  domain: DomainComponentCode;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  error?: Error | unknown;
}
