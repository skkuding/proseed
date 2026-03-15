import { RecordCategory } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  type ValidationArguments,
} from 'class-validator'

// 카테고리별 피드백 질문 개수 제한 (1~4개)
@ValidatorConstraint({ name: 'feedbackQuestionsPerCategory' })
export class FeedbackQuestionsPerCategoryConstraint implements ValidatorConstraintInterface {
  private readonly MIN = 1
  private readonly MAX = 4

  validate(questions: CreateFeedbackQuestionDto[]) {
    if (!Array.isArray(questions)) return false

    const grouped = new Map<RecordCategory, number>()
    for (const q of questions) {
      grouped.set(q.category, (grouped.get(q.category) ?? 0) + 1)
    }

    return [...grouped.values()].every(
      (count) => count >= this.MIN && count <= this.MAX,
    )
  }

  defaultMessage(args: ValidationArguments) {
    return `Each category must have between 1 and 4 feedback questions`
  }
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

export class CreateFeedbackQuestionDto {
  @IsEnum(RecordCategory)
  category: RecordCategory

  @IsString()
  @IsNotEmpty()
  content: string

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
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGrowthRecordDto)
  growthRecords: CreateGrowthRecordDto[]

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackQuestionDto)
  @Validate(FeedbackQuestionsPerCategoryConstraint)
  feedbackQuestions: CreateFeedbackQuestionDto[]
}
