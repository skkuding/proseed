import { RecordCategory } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class AdoptFeedbackDto {
  @IsEnum(RecordCategory)
  category: RecordCategory
}
