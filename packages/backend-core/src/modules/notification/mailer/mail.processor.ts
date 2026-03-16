import { Logger } from '@nestjs/common';

import { MailTaskQueueCode } from './mailer.constant';
import { SendMailJobHandler } from './send-mail.job';

import { CoreContext } from '@/modules/foundation';
import { JobProcessor, Processor } from '@/modules/messaging';

@Processor(MailTaskQueueCode)
export class MailProcessor extends JobProcessor {
  constructor(
    readonly coreContext: CoreContext,
    readonly sendMailJobHandler: SendMailJobHandler,
  ) {
    const logger = new Logger(MailProcessor.name);
    super(coreContext, logger, [sendMailJobHandler]);
  }
}
