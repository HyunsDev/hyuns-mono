import { Id } from '@workspace/primitive';

import { AbstractEntity } from './abstract.entity';

import { DomainResultAsync } from '@/error';

export abstract class RepositoryPort<TEntity extends AbstractEntity<unknown, Id>> {
  abstract findOneById(id: string): DomainResultAsync<TEntity | null, never>;
}
