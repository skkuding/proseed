import { Injectable } from '@nestjs/common'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { UpdateFeedbackDto } from './dto/update-feedback.dto'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    projectId: number,
    versionId: number,
    dto: CreateFeedbackDto,
  ) {
    const submission = await this.prisma.feedbackSubmission.create({
      data: {
        userId,
        projectId,
        versionId,
        oneLineReview: dto.oneLineReview,
        feedbacks: {
          create: dto.feedbacks.map((f) => ({
            questionId: f.questionId,
            content: f.content,
            // imageURL 어떻게 할까요?
            ...(f.imageURL ? { images: { create: { url: f.imageURL } } } : {}),
          })),
        },
      },
      include: {
        feedbacks: true,
      },
    })

    return {
      success: true,
      data: {
        submittedCount: submission.feedbacks.length,
        feedbacks: submission.feedbacks.map((f) => ({
          id: f.id,
          questionId: f.questionId,
          versionId: submission.versionId,
          userId: submission.userId,
          content: f.content,
          isAdopted: false,
          createdAt: f.createdAt,
        })),
      },
    }
  }
}
