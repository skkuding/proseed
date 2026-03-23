import { Module } from '@nestjs/common'
import {
  GrowthRecordController,
  GrowthRecordTemplateController,
} from './growth-record.controller'
import { GrowthRecordService } from './growth-record.service'

@Module({
  controllers: [GrowthRecordController, GrowthRecordTemplateController],
  providers: [GrowthRecordService],
})
export class GrowthRecordModule {}
