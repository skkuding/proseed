import { RecordCategory } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class AdoptFeedbackDto {
  @IsEnum(RecordCategory)
  category: RecordCategory
}

export class CategoryQuestionsDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(4)
  context: string[]
}

export class FeedbackQuestionsDto {
  @ValidateNested()
  @Type(() => CategoryQuestionsDto)
  PLAN: CategoryQuestionsDto

  @ValidateNested()
  @Type(() => CategoryQuestionsDto)
  DESIGN: CategoryQuestionsDto

  @ValidateNested()
  @Type(() => CategoryQuestionsDto)
  DEVELOPMENT: CategoryQuestionsDto

  @ValidateNested()
  @Type(() => CategoryQuestionsDto)
  GENERAL: CategoryQuestionsDto
}

export class CreateGrowthRecordContentDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false
}

export class CreateGrowthRecordDto {
  @IsEnum(RecordCategory)
  category: RecordCategory

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGrowthRecordContentDto)
  contents: CreateGrowthRecordContentDto[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageKeys?: string[] = []
}

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  version: string

  @IsString()
  @IsNotEmpty()
  updateGoal: string

  @IsArray()
  @IsString({ each: true })
  updateResults: string[]

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGrowthRecordDto)
  growthRecords: CreateGrowthRecordDto[]

  @ValidateNested()
  @Type(() => FeedbackQuestionsDto)
  feedbackQuestions: FeedbackQuestionsDto
}
