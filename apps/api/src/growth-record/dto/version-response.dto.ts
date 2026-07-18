import { ApiProperty } from '@nestjs/swagger'
import { JobType, ProjectCategory, RecordCategory } from '@prisma/client'

//발행/상세가 공유하는 피드백 질문 응답 shape
export class VersionFeedbackQuestionDto {
  id: number

  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  category: RecordCategory

  content: string
  isRequired: boolean
  order: number
}

export class FeedbackTemplateDto {
  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  category: RecordCategory

  questions: string[]
}

//--- 발행(POST) 응답: prisma include 결과라 전체 컬럼 포함 ---

export class PublishedGrowthRecordContentDto {
  id: number
  growthRecordId: number
  title: string
  content: string
  isDefault: boolean
}

export class PublishedGrowthRecordImageDto {
  id: number
  growthRecordId: number
  url: string
  order: number
  createdAt: Date
}

export class PublishedGrowthRecordDto {
  id: number
  versionId: number

  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  category: RecordCategory

  createdAt: Date
  updatedAt: Date
  contents: PublishedGrowthRecordContentDto[]
  images: PublishedGrowthRecordImageDto[]
}

export class PublishVersionResponseDto {
  id: number
  projectId: number
  version: string
  updateGoal: string
  updateResults: string[]

  @ApiProperty({ nullable: true, type: Date })
  releasedAt: Date | null

  createdAt: Date
  updatedAt: Date
  growthRecords: PublishedGrowthRecordDto[]
  feedbackQuestions: VersionFeedbackQuestionDto[]
}

//--- 버전 상세(GET) 응답: select된 필드 + presigned 이미지 + 태그된 피드백 ---

export class VersionDetailContentDto {
  title: string
  content: string
  isDefault: boolean
}

export class VersionDetailImageDto {
  /** presigned download URL */
  url: string
  order: number
}

export class TaggedFeedbackAuthorDto {
  name: string
  profileImageUrl: string

  @ApiProperty({ enum: JobType, enumName: 'JobType', nullable: true })
  role: JobType | null
}

export class TaggedFeedbackDto {
  /** 태그된 피드백 제출(submission) id */
  id: number

  author: TaggedFeedbackAuthorDto

  /** 제출의 한 줄 평가(oneLineReview) */
  content: string
}

export class VersionDetailGrowthRecordDto {
  id: number
  versionId: number

  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  category: RecordCategory

  createdAt: Date
  updatedAt: Date
  contents: VersionDetailContentDto[]
  images: VersionDetailImageDto[]
  taggedFeedbacks: TaggedFeedbackDto[]
}

export class VersionDetailResponseDto {
  id: number
  projectId: number
  version: string
  updateGoal: string
  updateResults: string[]

  @ApiProperty({ nullable: true, type: Date })
  releasedAt: Date | null

  createdAt: Date
  updatedAt: Date
  growthRecords: VersionDetailGrowthRecordDto[]
  feedbackQuestions: VersionFeedbackQuestionDto[]
}

//mainpage 최근 성장기록 카드 — 발행 버전×직군 단위
export class RecentGrowthRecordDto {
  growthRecordId: number
  versionId: number
  projectId: number
  projectName: string

  /** presigned download URL */
  projectIconUrl: string

  @ApiProperty({
    enum: ProjectCategory,
    enumName: 'ProjectCategory',
    isArray: true,
  })
  projectCategories: ProjectCategory[]

  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  category: RecordCategory

  /** 해당 직군 성장기록의 첫 번째 content title */
  title: string

  updateGoal: string
  releasedAt: Date
}
