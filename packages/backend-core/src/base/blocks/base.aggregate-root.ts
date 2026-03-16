import { AbstractAggregateRoot } from '@workspace/backend-ddd';
import { Id } from '@workspace/primitive';

import { BaseDomainEvent, BaseDomainEventProps } from '../messages/base.domain-event';

export abstract class BaseAggregateRoot<TProps, TId extends Id> extends AbstractAggregateRoot<
  TProps,
  TId,
  BaseDomainEvent<BaseDomainEventProps<unknown>>
> {}
