import type { CommandCode } from './command.unit-codes';
import type { DomainEventCode } from './domain-event.unit-codes';
import type { HttpRequestCode } from './http-request.unit-codes';
import type { IntegrationEventCode } from './integration-event.unit-codes';
import type { JobCode } from './job.unit-codes';
import type { QueryCode } from './query.unit-codes';
import type { RpcCode } from './rpc.unit-codes';
import type { TriggerCode } from './trigger.unit-codes';

export type MessageCode =
  | CommandCode
  | QueryCode
  | DomainEventCode
  | HttpRequestCode
  | IntegrationEventCode
  | JobCode
  | RpcCode
  | TriggerCode;
