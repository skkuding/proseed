import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { RecordCategory } from '@prisma/client'

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
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FeedbackItemDto)
  feedbacks!: FeedbackItemDto[]
}

// 성장기록(버전)이 아직 없는 프로젝트에 남기는 자유 피드백의 직군별 답변 하나
export class FreeformFeedbackItemDto {
  @IsEnum(RecordCategory)
  category!: RecordCategory

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_FEEDBACK_IMAGES_PER_ITEM)
  @IsString({ each: true })
  imageUrls?: string[]
}

// 성장기록(버전)이 아직 없는 프로젝트에 남기는 자유 피드백 — 질문 없이 직군별 자유 텍스트로만 구성.
// 한 줄 평가는 제출 전체에서 공유하고, 직군은 하나 이상 선택해 각각 자유 텍스트를 남길 수 있다.
export class CreateFreeformFeedbackDto {
  @IsString()
  @IsNotEmpty()
  oneLineReview!: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FreeformFeedbackItemDto)
  feedbacks!: FreeformFeedbackItemDto[]
}
