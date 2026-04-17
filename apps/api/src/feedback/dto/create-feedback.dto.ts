import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  IsOptional,
} from 'class-validator'

export class FeedbackItemDto {
  @IsNumber()
  @IsNotEmpty()
  questionId!: number

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsOptional()
  @IsString()
  imageURL?: string
}

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  oneLineReview!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackItemDto)
  feedbacks!: FeedbackItemDto[]
}
