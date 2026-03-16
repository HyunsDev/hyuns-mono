import { AbstractDtoMapper } from '@workspace/backend-ddd';
import { Id } from '@workspace/primitive';

import { BaseEntity } from '../blocks';

export abstract class BaseDtoMapper<
  TEntity extends BaseEntity<unknown, Id>,
> extends AbstractDtoMapper<TEntity> {}
