/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChangeCode, ChangeId, DomainComponentCode, Id, UserId } from '@workspace/primitive';

import type { ApiError } from '@/api-error';
import type { ValueOf } from '@/type';

/**
 * ChangeAction 상수를 정의합니다.
 * @description `UnitCode` 호환성을 위해 소문자 형태로 값을 지정합니다.
 */
export const ChangeAction = {
  Create: 'create' as const,
  Update: 'update' as const,
  Delete: 'delete' as const,
} as const;
export type ChangeAction = ValueOf<typeof ChangeAction>;

export const ChangeStatus = {
  Staged: 'staged' as const,
  Pending: 'pending' as const,
  Committed: 'committed' as const,
  Rejected: 'rejected' as const,
} as const;
export type ChangeStatus = ValueOf<typeof ChangeStatus>;

export type ChangeSpec<T extends ChangeAction = ChangeAction> = Readonly<{
  Action: T;
  Payload: any;
  Value: any;
  Error: ApiError;
  TargetType: DomainComponentCode;
  TargetId: Id;
}>;
export type CreateChangeSpec = ChangeSpec<'create'>;
export type UpdateChangeSpec = ChangeSpec<'update'>;
export type DeleteChangeSpec = ChangeSpec<'delete'>;

export interface BaseChange<T extends ChangeSpec> {
  id: ChangeId;
  code: ChangeCode;
  status: ChangeStatus;
  targetType: T['TargetType'];
  targetId: T['TargetId'];
  createdAt: string;
  action: T['Action'];
}

export interface StagedChange<T extends ChangeSpec> extends BaseChange<T> {
  status: 'staged';
  payload: T['Payload'];
}

export interface PendingChange<T extends ChangeSpec> extends BaseChange<T> {
  status: 'pending';
  payload: T['Payload'];
  actorType: typeof DomainComponentCode.Account.User;
  actorId: UserId;
}

export interface CommittedChange<T extends ChangeSpec> extends BaseChange<T> {
  status: 'committed';
  payload: T['Payload'];
  actorType: typeof DomainComponentCode.Account.User;
  actorId: UserId;
  resolvedAt: string;
  value: T['Value'];
}

export interface RejectedChange<T extends ChangeSpec> extends BaseChange<T> {
  status: 'rejected';
  payload: T['Payload'];
  actorType: typeof DomainComponentCode.Account.User;
  actorId: UserId;
  resolvedAt: string;
  error: T['Error'];
}

export type ResolvedChange<T extends ChangeSpec> = CommittedChange<T> | RejectedChange<T>;

export type Change<T extends ChangeSpec> =
  | StagedChange<T>
  | PendingChange<T>
  | RejectedChange<T>
  | CommittedChange<T>;

export interface CommittedChangeResult<T extends ChangeSpec> extends BaseChange<T> {
  status: 'committed';
  actorType: typeof DomainComponentCode.Account.User;
  actorId: UserId;
  resolvedAt: string;
  value: T['Value'];
}

export interface RejectedChangeResult<T extends ChangeSpec> extends BaseChange<T> {
  status: 'rejected';
  actorType: typeof DomainComponentCode.Account.User;
  actorId: UserId;
  resolvedAt: number;
  error: T['Error'];
}
