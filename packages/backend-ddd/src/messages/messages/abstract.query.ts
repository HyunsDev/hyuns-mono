import { AbstractMessage, AbstractMessageProps } from './abstract.message';
import { RESULT_TYPE_SYMBOL } from '../message.constant';
import { AbstractMessageGenerics } from '../message.types';

import { DomainError, DomainResult } from '@/error';

export type AbstractQueryProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractQuery<
  TGenerics extends AbstractMessageGenerics = AbstractMessageGenerics,
  TProps extends AbstractQueryProps = AbstractQueryProps,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> = DomainResult<TOk, DomainError>,
> extends AbstractMessage<TGenerics, TProps, TOk, TRes> {
  declare [RESULT_TYPE_SYMBOL]: TRes;
}
