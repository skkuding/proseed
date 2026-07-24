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
  versionId: number
  projectId: number
  projectTitle: string
  projectIconUrl: string
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

//버전의 피드백 목록 — 제출(submission) 정보를 답변마다 함께 내려줘 FE가 제출 단위로 그룹핑 가능
export class FeedbackListItemDto extends FeedbackSubmissionAnswerDto {
  submissionId: number
  userId: number
  author: FeedbackSubmissionAuthorDto
  oneLineReview: string

  /** 이미 다른 성장기록에 채택(태그)된 제출인지 — 성장기록 발행의 피드백 태그하기에서 재태그 방지용 */
  isAdopted: boolean

  /** 이 제출이 열람(unlock)됐는지. false면 content/imageUrls는 서버에서 비워서 내려감 */
  isUnlocked: boolean
}

export class FeedbackListResponseDto {
  success: boolean
  data: FeedbackListItemDto[]
}

//피드백 열람(unlock) 응답 — 티켓 1개 차감 후 잔액 반환
export class UnlockFeedbackDataDto {
  submissionId: number
  isUnlocked: boolean

  /** 이번 요청에서 실제로 티켓이 차감됐는지. 이미 열려 있던 제출이면 false(무과금) */
  charged: boolean

  /** 차감 후 남은 티켓 수 */
  remainingTickets: number
}

export class UnlockFeedbackResponseDto {
  success: boolean
  data: UnlockFeedbackDataDto
}

//mainpage 최근 피드백 카드 — 채택(FeedbackAdoption)된 제출×직군 단위
export class RecentFeedbackItemDto {
  submissionId: number
  versionId: number

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
