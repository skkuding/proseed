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
  Matches,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator'

const ALL_RECORD_CATEGORIES = Object.values(RecordCategory)

// 직군당 태그(=채택) 가능한 피드백 제출 수
export const MAX_TAGGED_FEEDBACKS_PER_CATEGORY = 3

// 성장기록 버전 형식: major.minor.patch
export const VERSION_PATTERN = /^\d+\.\d+\.\d+$/

// 피드백 질문은 4개 직군 전부 필수, 직군당 1~4개
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

    return ALL_RECORD_CATEGORIES.every((category) => {
      const count = grouped.get(category) ?? 0
      return count >= this.MIN && count <= this.MAX
    })
  }

  defaultMessage() {
    return `Every category (${ALL_RECORD_CATEGORIES.join(', ')}) must have between 1 and 4 feedback questions`
  }
}

// 성장기록은 4개 직군을 정확히 하나씩 전부 포함
@ValidatorConstraint({ name: 'growthRecordCategoryCoverage' })
export class GrowthRecordCategoryCoverageConstraint implements ValidatorConstraintInterface {
  validate(records: CreateGrowthRecordDto[]) {
    if (!Array.isArray(records)) return false

    const categories = records.map((r) => r?.category)
    return (
      categories.length === ALL_RECORD_CATEGORIES.length &&
      new Set(categories).size === categories.length &&
      ALL_RECORD_CATEGORIES.every((c) => categories.includes(c))
    )
  }

  defaultMessage() {
    return `Growth records must cover every category exactly once (${ALL_RECORD_CATEGORIES.join(', ')})`
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
  @ArrayMaxSize(8)
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

// 태그(=채택)할 피드백 제출 참조 — FeedbackSubmission의 @@unique([versionId, userId])로
// 제출을 특정. FE는 submissionId를 알 방법이 없어 (버전 id, 작성자 id) 쌍으로 대신 지정
export class TaggedSubmissionRefDto {
  @IsInt()
  versionId: number

  @IsInt()
  userId: number
}

// 태그(=채택)할 이전 버전 피드백 제출 — 직군별 최대 3개
export class TaggedFeedbacksDto {
  @IsEnum(RecordCategory)
  category: RecordCategory

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_TAGGED_FEEDBACKS_PER_CATEGORY)
  @ValidateNested({ each: true })
  @Type(() => TaggedSubmissionRefDto)
  submissions: TaggedSubmissionRefDto[]
}

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(VERSION_PATTERN, {
    message: 'version must be in major.minor.patch format (e.g. 1.2.0)',
  })
  version: string

  @IsString()
  @IsNotEmpty()
  updateGoal: string

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  updateResults: string[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGrowthRecordDto)
  @Validate(GrowthRecordCategoryCoverageConstraint)
  growthRecords: CreateGrowthRecordDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackQuestionDto)
  @Validate(FeedbackQuestionsPerCategoryConstraint)
  feedbackQuestions: CreateFeedbackQuestionDto[]

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TaggedFeedbacksDto)
  taggedFeedbacks?: TaggedFeedbacksDto[]
}
