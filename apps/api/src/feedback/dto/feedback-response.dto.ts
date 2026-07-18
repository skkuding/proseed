import { ApiProperty } from '@nestjs/swagger'
import { JobType, RecordCategory } from '@prisma/client'

export class CreatedFeedbackDto {
  id: number
  questionId: number
  versionId: number
  userId: number
  content: string

  @ApiProperty({ nullable: true, type: String })
  imageUrl: string | null

  @ApiProperty({ type: [String] })
  imageUrls: string[]

  createdAt: Date
}

export class CreateFeedbackDataDto {
  submittedCount: number
  feedbacks: CreatedFeedbackDto[]
}

export class CreateFeedbackResponseDto {
  success: boolean
  data: CreateFeedbackDataDto
}

export class FeedbackQuestionItemDto {
  id: number

  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  category: RecordCategory

  title: string
  description: string
  order: number
  required: boolean
}

export class FeedbackQuestionsResponseDto {
  success: boolean
  data: FeedbackQuestionItemDto[]
}

export class MyFeedbackProjectItemDto {
  submissionId: number
  projectId: number
  projectTitle: string
  projectThumbnailUrl: string
  oneLineDescription: string
  isAdopted: boolean
  createdAt: Date
}

export class MyFeedbackProjectsResponseDto {
  success: boolean
  data: MyFeedbackProjectItemDto[]
}

export class FeedbackSubmissionAuthorDto {
  name: string
  profileImageUrl: string

  @ApiProperty({ enum: JobType, enumName: 'JobType', nullable: true })
  role: JobType | null
}

export class FeedbackSubmissionAnswerDto {
  id: number
  questionId: number

  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  category: RecordCategory

  questionTitle: string
  questionContent: string
  content: string

  @ApiProperty({ type: [String] })
  imageUrls: string[]

  createdAt: Date
  updatedAt: Date
}

export class FeedbackSubmissionDetailDto {
  id: number
  projectId: number
  versionId: number
  oneLineReview: string
  author: FeedbackSubmissionAuthorDto
  createdAt: Date
  updatedAt: Date
  feedbacks: FeedbackSubmissionAnswerDto[]
}

export class FeedbackSubmissionDetailResponseDto {
  success: boolean
  data: FeedbackSubmissionDetailDto
}

//mainpage 최근 피드백 카드 — 채택(FeedbackAdoption)된 제출×직군 단위
export class RecentFeedbackItemDto {
  submissionId: number

  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  category: RecordCategory

  nickname: string
  profileImageUrl: string
  oneLineReview: string

  /** 채택된 직군 질문에 대한 첫 번째 답변 본문 */
  content: string

  projectId: number
  projectName: string

  /** presigned download URL */
  projectIconUrl: string
}

export class RecentFeedbacksResponseDto {
  success: boolean
  data: RecentFeedbackItemDto[]
}
