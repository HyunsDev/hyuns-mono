import { Logger } from '@nestjs/common';

import { StorageTaskQueueCode } from '../storage.constant';
import { CleanUpOrphanFilesJobHandler } from './jobs/clean-up-orphan-files.job';

import { CoreContext } from '@/modules/foundation/context';
import { Processor } from '@/modules/messaging/task-queue/decorators';
import { JobProcessor } from '@/modules/messaging/task-queue/job.processor';

@Processor(StorageTaskQueueCode)
export class StorageProcessor extends JobProcessor {
  constructor(
    readonly cleanUpOrphanFilesJobHandler: CleanUpOrphanFilesJobHandler,
    readonly coreContext: CoreContext,
  ) {
    const logger = new Logger(StorageProcessor.name);
    super(coreContext, logger, [cleanUpOrphanFilesJobHandler]);
  }
}
