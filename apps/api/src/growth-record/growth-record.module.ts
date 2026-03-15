import { Module } from '@nestjs/common'
import { GrowthRecordController } from './growth-record.controller'
import { GrowthRecordService } from './growth-record.service'

@Module({
  controllers: [GrowthRecordController],
  providers: [GrowthRecordService],
})
export class GrowthRecordModule {}
