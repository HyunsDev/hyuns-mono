import { AbstractDrivenMessageMetadata, AbstractMessageMetadata } from '@workspace/backend-ddd';
import { MessageCode } from '@workspace/primitive';

import { BaseMessageGenerics } from './message.types';

export type MessageMetadata = AbstractMessageMetadata<BaseMessageGenerics<MessageCode>>;

export type DrivenMessageMetadata = AbstractDrivenMessageMetadata<BaseMessageGenerics<MessageCode>>;
