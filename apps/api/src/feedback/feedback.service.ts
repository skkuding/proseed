import { Injectable } from '@nestjs/common'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { UpdateFeedbackDto } from './dto/update-feedback.dto'
import { PrismaService } from '../prisma/prisma.service'
import { EntityNotExistException } from 'src/common/exceptions/business.exception'

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(
    userId: number,
    projectId: number,
    versionId: number,
    dto: CreateFeedbackDto,
  ) {
    const targetVersion = await this.prisma.projectVersion.findFirst({
      where: {
        id: versionId,
        projectId: projectId,
      },
      select: {
        feedbackQuestions: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!targetVersion) {
      throw new EntityNotExistException('projectVersion')
    }

    const validQuestionIds = new Set(
      targetVersion.feedbackQuestions.map((q) => q.id),
    )
    const isAllQuestionsValid = dto.feedbacks.every((f) =>
      validQuestionIds.has(f.questionId),
    )

    if (!isAllQuestionsValid) {
      throw new EntityNotExistException('feedbackQuestion')
    }

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
