import type { Brand } from '@/utils/brand.type';

export const TriggerType = {
  Http: 'http',
  Webhook: 'webhook',
  Scheduler: 'scheduler',
  Initialize: 'initialize',
  Console: 'console',
  Test: 'test',
  Unknown: 'unknown',
} as const;
export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

const defineTriggerCode = <const T extends `system:trigger:tri:${TriggerType}`>(
  code: T,
): Brand<T, 'TriggerCode'> => code as unknown as Brand<T, 'TriggerCode'>;

export const TriggerCode = {
  Http: defineTriggerCode('system:trigger:tri:http'),
  Webhook: defineTriggerCode('system:trigger:tri:webhook'),
  Scheduler: defineTriggerCode('system:trigger:tri:scheduler'),
  Initialize: defineTriggerCode('system:trigger:tri:initialize'),
  Console: defineTriggerCode('system:trigger:tri:console'),
  Test: defineTriggerCode('system:trigger:tri:test'),
  Unknown: defineTriggerCode('system:trigger:tri:unknown'),
} as const;

export type TriggerCode = (typeof TriggerCode)[keyof typeof TriggerCode];
