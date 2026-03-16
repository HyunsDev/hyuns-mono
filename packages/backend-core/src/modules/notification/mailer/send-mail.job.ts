import { asJobCode, DomainComponentCode } from '@workspace/primitive';

import { MailTaskQueueCode } from './mailer.constant';
import { MailerService } from './mailer.service';
import { SendMailOptions, SendMailOptionsSchema } from './mailer.types';

import { BaseJob, BaseJobProps, IJobHandler } from '@/base';
import { JobHandler } from '@/modules/messaging';

export type SendMailJobProps = BaseJobProps<SendMailOptions>;

export class SendMailJob extends BaseJob<SendMailJobProps> {
  static readonly code = asJobCode('notification:email:job:send_mail');
  readonly queueName = MailTaskQueueCode;
  readonly resourceType = DomainComponentCode.Notification.Email;
  get schema() {
    return SendMailOptionsSchema;
  }
}

@JobHandler(SendMailJob)
export class SendMailJobHandler implements IJobHandler<SendMailJob> {
  constructor(private readonly mailerService: MailerService) {}

  async execute(job: SendMailJob) {
    const { to, subject, html, text } = job.data;
    const result = await this.mailerService.sendEmail({ to, subject, html, text });
    return result.map(() => undefined);
  }
}
