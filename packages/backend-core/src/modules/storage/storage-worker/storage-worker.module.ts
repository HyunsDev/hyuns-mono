import { Module } from '@nestjs/common';

import { CleanUpOrphanFilesJobHandler } from './jobs/clean-up-orphan-files.job';
import { StorageProcessor } from './storage.processor';
import { StorageScheduler } from './storage.scheduler';
import { StorageModule } from '../storage/storage.module';
import { StorageTaskQueueCode } from '../storage.constant';

import { TaskQueueModule } from '@/modules/messaging/task-queue';

@Module({
  imports: [StorageModule, TaskQueueModule.forFeature({ queue: { name: StorageTaskQueueCode } })],
  providers: [StorageProcessor, CleanUpOrphanFilesJobHandler, StorageScheduler],
})
export class StorageWorkerModule {}
