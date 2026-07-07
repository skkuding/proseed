import { ApiProperty } from '@nestjs/swagger'
import { RecordCategory } from '@prisma/client'

export class CreatedFeedbackDto {
  id: number
  questionId: number
  versionId: number
  userId: number
  content: string

  @ApiProperty({ nullable: true, type: String })
  imageUrl: string | null

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
