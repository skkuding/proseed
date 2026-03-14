import { RecordCategory } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'

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
  @ValidateNested({ each: true })
  @Type(() => CreateGrowthRecordContentDto)
  contents: CreateGrowthRecordContentDto[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageKeys?: string[] = []
}

export class CreateFeedbackQuestionDto {
  @IsEnum(RecordCategory)
  category: RecordCategory

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsInt()
  @Min(0)
  order: number

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = false
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
  @ValidateNested({ each: true })
  @Type(() => CreateGrowthRecordDto)
  growthRecords: CreateGrowthRecordDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackQuestionDto)
  feedbackQuestions: CreateFeedbackQuestionDto[]
}
