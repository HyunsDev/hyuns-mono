import { asIntegrationEventCode, DomainComponentCode } from '@workspace/primitive';

import { SseEmitOptions, SseEmitOptionsSchema } from './sse.types';

import { BaseIntegrationEvent, BaseIntegrationEventProps } from '@/base';

export type SseIntegrationEventProps = BaseIntegrationEventProps<SseEmitOptions>;

export class SseIntegrationEvent extends BaseIntegrationEvent<SseIntegrationEventProps> {
  readonly resourceType = DomainComponentCode.Notification.Sse;
  static readonly code = asIntegrationEventCode('notification:sse:pub:sse');
  get schema() {
    return SseEmitOptionsSchema;
  }
}
