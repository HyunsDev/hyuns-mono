import z from 'zod';

import { ChangeIdSchema, UserIdSchema } from '@workspace/primitive';

import { ChangeAction, ChangeStatus, type ChangeSpec } from './change';
import { createApiErrorSchema } from '../api-error';
import { safeDiscriminatedUnion } from '../schema';

export const createStagedChangeSchema = <const A extends ChangeAction>(options: {
  action: A;
  targetType: ChangeSpec<A>['TargetType'];
  targetId: z.ZodType<ChangeSpec<A>['TargetId']>;
  payload: z.ZodType<ChangeSpec<A>['Payload']>;
}) => {
  return z.object({
    id: ChangeIdSchema,
    code: z.literal(`${options.targetType}:chg:${options.action}`),
    status: z.literal(ChangeStatus.Staged),
    targetType: z.literal(options.targetType),
    targetId: options.targetId,
    createdAt: z.iso.datetime(),
    action: z.literal(options.action),
    payload: options.payload,
  });
};
export type StagedChangeSchema<A extends ChangeAction> = ReturnType<
  typeof createStagedChangeSchema<A>
>;

export const createCommittedChangeResultSchema = <const A extends ChangeAction>(options: {
  action: A;
  targetType: ChangeSpec<A>['TargetType'];
  targetId: z.ZodType<ChangeSpec<A>['TargetId']>;
  value: z.ZodType<ChangeSpec<A>['Value']>;
}) => {
  return z.object({
    id: ChangeIdSchema,
    code: z.literal(`${options.targetType}:chg:${options.action}`),
    status: z.literal(ChangeStatus.Committed),
    targetType: z.literal(options.targetType),
    targetId: options.targetId,
    createdAt: z.iso.datetime(),
    action: z.literal(options.action),
    actorType: z.literal('account:user'),
    actorId: UserIdSchema,
    resolvedAt: z.iso.datetime(),
    value: options.value,
  });
};
export type CommittedChangeResultSchema<A extends ChangeAction> = ReturnType<
  typeof createCommittedChangeResultSchema<A>
>;

export const createRejectedChangeResultSchema = <
  const A extends ChangeAction,
  const TErrs extends ChangeSpec<A>['Error'][] = ChangeSpec<A>['Error'][],
>(options: {
  action: A;
  targetType: ChangeSpec<A>['TargetType'];
  targetId: z.ZodType<ChangeSpec<A>['TargetId']>;
  errors: TErrs;
}) => {
  const errorUnionSchema = safeDiscriminatedUnion(
    'code',
    options.errors.map((err) => createApiErrorSchema(err)),
  ) as z.ZodType<TErrs[number]>;

  return z.object({
    id: ChangeIdSchema,
    code: z.literal(`${options.targetType}:chg:${options.action}`),
    status: z.literal(ChangeStatus.Rejected),
    targetType: z.literal(options.targetType),
    targetId: options.targetId,
    createdAt: z.iso.datetime(),
    action: z.literal(options.action),
    actorType: z.literal('account:user'),
    actorId: UserIdSchema,
    resolvedAt: z.iso.datetime(),
    error: errorUnionSchema,
  });
};
export type RejectedChangeResultSchema<A extends ChangeAction> = ReturnType<
  typeof createRejectedChangeResultSchema<A>
>;

export const createChangeResultSchema = <
  const A extends ChangeAction,
  const TErrs extends ChangeSpec<A>['Error'][] = ChangeSpec<A>['Error'][],
>(options: {
  action: A;
  targetType: ChangeSpec<A>['TargetType'];
  targetId: z.ZodType<ChangeSpec<A>['TargetId']>;
  value: z.ZodType<ChangeSpec<A>['Value']>;
  errors: TErrs;
}) => {
  const committedSchema = createCommittedChangeResultSchema(options);
  const rejectedSchema = createRejectedChangeResultSchema<A, TErrs>(options);

  return z.discriminatedUnion('status', [committedSchema, rejectedSchema]);
};
export type ChangeResultSchema<
  A extends ChangeAction,
  TErrs extends ChangeSpec<A>['Error'][],
> = ReturnType<typeof createChangeResultSchema<A, TErrs>>;
