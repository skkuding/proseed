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
  Validate,
  ValidateNested,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator'

export class AdoptFeedbackDto {
  @IsEnum(RecordCategory)
  category: RecordCategory
}

export class CategoryQuestionsDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayMaxSize(4)
  context: string[]
}

@ValidatorConstraint({ name: 'atLeastOneQuestion', async: false })
export class AtLeastOneQuestionConstraint implements ValidatorConstraintInterface {
  validate(feedbackQuestions: FeedbackQuestionsDto) {
    if (!feedbackQuestions) return false

    const totalQuestions = (
      Object.values(feedbackQuestions) as CategoryQuestionsDto[]
    ).reduce(
      (sum: number, category: CategoryQuestionsDto) =>
        sum + (category?.context?.length ?? 0),
      0,
    )

    return totalQuestions >= 1
  }

  defaultMessage() {
    return 'There must be at least one feedback question across all categories'
  }
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
  @Validate(AtLeastOneQuestionConstraint)
  feedbackQuestions: FeedbackQuestionsDto
}
