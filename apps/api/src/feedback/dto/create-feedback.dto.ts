import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export const MAX_FEEDBACK_IMAGES_PER_ITEM = 8

export class FeedbackItemDto {
  @IsNumber()
  @IsNotEmpty()
  questionId!: number

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_FEEDBACK_IMAGES_PER_ITEM)
  @IsString({ each: true })
  imageUrls?: string[]
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
