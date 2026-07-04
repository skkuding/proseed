import { Module } from '@nestjs/common'
import { GrowthRecordDraftController } from './growth-record-draft.controller'
import { GrowthRecordDraftService } from './growth-record-draft.service'
import {
  GrowthRecordController,
  GrowthRecordTemplateController,
} from './growth-record.controller'
import { GrowthRecordService } from './growth-record.service'

@Module({
  controllers: [
    GrowthRecordController,
    GrowthRecordTemplateController,
    GrowthRecordDraftController,
  ],
  providers: [GrowthRecordService, GrowthRecordDraftService],
})
export class GrowthRecordModule {}
