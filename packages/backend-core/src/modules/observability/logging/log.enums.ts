import { uniqueDeepMerge } from '@workspace/shared';

export const GeneralLogTypeEnum = {
  Http: 'http',
  System: 'system',
  Domain: 'domain',
  General: 'general',
} as const;
export type GeneralLogTypeEnum = typeof GeneralLogTypeEnum;
export type GeneralLogType = (typeof GeneralLogTypeEnum)[keyof typeof GeneralLogTypeEnum];

export const MessageLogTypeEnum = {
  Command: 'command',
  Query: 'query',
  Event: 'event',
  Job: 'job',
  IntegrationEvent: 'integration_event',
  Rpc: 'rpc',
  HttpRequest: 'http_request',
  EventPublished: 'event_published',
} as const;
export type MessageLogTypeEnum = typeof MessageLogTypeEnum;
export type MessageLogType = (typeof MessageLogTypeEnum)[keyof typeof MessageLogTypeEnum];
export const MessageLogTypes = Object.values(MessageLogTypeEnum);

export const LogTypeEnum = uniqueDeepMerge(GeneralLogTypeEnum, MessageLogTypeEnum);
export type LogTypeEnum = typeof LogTypeEnum;
export type LogType = (typeof LogTypeEnum)[keyof typeof LogTypeEnum];
