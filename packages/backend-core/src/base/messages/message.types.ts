import { DomainComponentCode, MessageCode, UserId } from '@workspace/primitive';

export type BaseMessageGenerics<TMessageCode extends MessageCode> = Readonly<{
  TCausationType: MessageCode;
  TResourceCode: DomainComponentCode;
  TMessageCode: TMessageCode;
  TUserId: UserId;
}>;
