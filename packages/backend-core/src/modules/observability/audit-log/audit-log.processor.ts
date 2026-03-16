import { Logger } from '@nestjs/common';

import { AuditLogTaskQueueCode } from './audit-log.constant';
import { AuditLogJobHandler } from './audit-log.job';

import { CoreContext } from '@/modules/foundation';
import { JobProcessor, Processor } from '@/modules/messaging';

@Processor(AuditLogTaskQueueCode)
export class AuditLogProcessor extends JobProcessor {
  constructor(
    readonly coreContext: CoreContext,
    readonly auditLogJobHandler: AuditLogJobHandler,
  ) {
    const logger = new Logger(AuditLogProcessor.name);
    super(coreContext, logger, [auditLogJobHandler]);
  }
}
