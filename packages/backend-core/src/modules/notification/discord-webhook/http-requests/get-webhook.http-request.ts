import { asHttpRequestCode, DomainComponentCode } from '@workspace/primitive';

import { BaseHttpRequest, BaseHttpRequestProps } from '@/base';

export type GetWebhookHttpRequestProps = BaseHttpRequestProps<{
  url: string;
  method: 'GET';
}>;
export class GetWebhookHttpRequest extends BaseHttpRequest<
  GetWebhookHttpRequestProps,
  {
    status: 200;
    data: {
      channel_id: string;
      guild_id: string;
      id: string;
      name: string;
      avatar: string | null;
    };
  }
> {
  readonly resourceType = DomainComponentCode.Notification.DiscordWebhook;
  static readonly code = asHttpRequestCode('notification:discord_webhook:web:get_webhook');

  constructor(url: string) {
    super(null, { url, method: 'GET' });
  }
}
