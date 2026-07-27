import { ApiProperty } from '@nestjs/swagger'
import { RecordCategory } from '@prisma/client'
import { IsEnum } from 'class-validator'

//직군 단위 unlock — 같은 제출이라도 직군마다 별도로 열어야 함
export class UnlockFeedbackDto {
  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  @IsEnum(RecordCategory)
  category: RecordCategory
}
