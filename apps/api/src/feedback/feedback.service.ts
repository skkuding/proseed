import { Injectable } from '@nestjs/common'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { UpdateFeedbackDto } from './dto/update-feedback.dto'
import { PrismaService } from '../prisma/prisma.service'
import {
  EntityNotExistException,
  UnprocessableDataException,
} from 'src/common/exceptions/business.exception'
import { success } from 'better-auth'

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
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
            isRequired: true,
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
    const requiredQuestionIds = targetVersion.feedbackQuestions
      .filter((q) => q.isRequired)
      .map((q) => q.id)

    const submittedQuestionIds = dto.feedbacks.map((f) => f.questionId)
    const submittedQuestionSet = new Set(submittedQuestionIds)

    // 1. 모든 제출된 질문 ID가 해당 버전의 유효한 질문인지 확인
    if (!submittedQuestionIds.every((id) => validQuestionIds.has(id))) {
      throw new EntityNotExistException('feedbackQuestion')
    }

    // 2. 동일한 질문에 대한 중복 답변이 있는지 확인
    if (submittedQuestionSet.size !== submittedQuestionIds.length) {
      throw new UnprocessableDataException(
        'Duplicate feedback for the same question',
      )
    }

    // 3. 필수 질문이 모두 포함되었는지 확인
    const missingRequired = requiredQuestionIds.filter(
      (id) => !submittedQuestionSet.has(id),
    )
    if (missingRequired.length > 0) {
      throw new UnprocessableDataException(
        'Missing required questions: ' + missingRequired.join(', '),
      )
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
            images: f.imageURL
              ? {
                  create: {
                    url: f.imageURL,
                  },
                }
              : undefined,
          })),
        },
      },
      include: {
        feedbacks: {
          include: {
            images: true,
          },
        },
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
          imageUrl: f.images[0]?.url || null,
          isAdopted: false,
          createdAt: f.createdAt,
        })),
      },
    }
  }

  async findAllQuestions(projectId: number, versionId: number) {
    //1. 해당 버전이 프로젝트에 존재하는지 확인하며 질문 가져오기
    const targetVersion = await this.prisma.projectVersion.findFirst({
      where: {
        id: versionId,
        projectId: projectId,
      },
      include: {
        feedbackQuestions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    //2. 해당 버전이 없으면 예외 던지기
    if (!targetVersion) {
      throw new EntityNotExistException('projectVersion')
    }

    //3. 데이터를 포멧에 맞춰 반환
    return {
      success: true,
      data: targetVersion.feedbackQuestions.map((q) => ({
        id: q.id,
        category: q.category,
        title: q.title,
        description: q.description,
        order: q.order,
        required: q.isRequired,
      })),
    }
  }
}
