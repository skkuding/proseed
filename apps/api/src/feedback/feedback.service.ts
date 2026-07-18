import { Injectable } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import {
  CreateFeedbackDto,
  MAX_FEEDBACK_IMAGES_PER_ITEM,
} from './dto/create-feedback.dto'
import {
  CreateFeedbackResponseDto,
  FeedbackSubmissionDetailResponseDto,
  FeedbackQuestionsResponseDto,
  MyFeedbackProjectsResponseDto,
} from './dto/feedback-response.dto'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import {
  DuplicateFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException,
} from 'src/common/exceptions/business.exception'

const FEEDBACK_ALLOWED_USER_ROLES: readonly UserRole[] = [
  UserRole.Sprout,
  UserRole.Seeder,
]

type FeedbackImageInput = { url: string; order: number }

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findFeedbackSubmissionDetail(
    userId: number,
    submissionId: number,
  ): Promise<FeedbackSubmissionDetailResponseDto> {
    const submission = await this.prisma.feedbackSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        userId: true,
        projectId: true,
        versionId: true,
        oneLineReview: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            profileImageUrl: true,
            jobType: true,
          },
        },
        feedbacks: {
          select: {
            id: true,
            questionId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            question: {
              select: {
                category: true,
                title: true,
                description: true,
                order: true,
              },
            },
            images: {
              select: { url: true, order: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!submission) {
      throw new EntityNotExistException('FeedbackSubmission')
    }

    const isAuthor = submission.userId === userId
    if (!isAuthor) {
      const isProjectMember = await this.prisma.projectRole.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId: submission.projectId,
          },
        },
      })

      if (!isProjectMember) {
        throw new ForbiddenAccessException('Access denied')
      }
    }

    const feedbacks = await Promise.all(
      submission.feedbacks
        .sort((a, b) => a.question.order - b.question.order)
        .map(async (feedback) => ({
          id: feedback.id,
          questionId: feedback.questionId,
          category: feedback.question.category,
          questionTitle: feedback.question.title,
          questionContent: feedback.question.description,
          content: feedback.content,
          imageUrls: await Promise.all(
            feedback.images.map((image) =>
              this.storage.getSignedDownloadUrl(image.url),
            ),
          ),
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt,
        })),
    )

    return {
      success: true,
      data: {
        id: submission.id,
        projectId: submission.projectId,
        versionId: submission.versionId,
        oneLineReview: submission.oneLineReview,
        author: {
          name: submission.user.name,
          profileImageUrl: submission.user.profileImageUrl,
          role: submission.user.jobType,
        },
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        feedbacks,
      },
    }
  }

  async findMyFeedbackProjects(
    userId: number,
  ): Promise<MyFeedbackProjectsResponseDto> {
    const submissions = await this.prisma.feedbackSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        adoptions: {
          select: { id: true },
          take: 1,
        },
        project: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            oneLineDescription: true,
          },
        },
      },
    })

    return {
      success: true,
      data: submissions.map((submission) => ({
        submissionId: submission.id,
        projectId: submission.project.id,
        projectTitle: submission.project.title,
        projectThumbnailUrl: submission.project.thumbnailUrl,
        oneLineDescription: submission.project.oneLineDescription,
        isAdopted: submission.adoptions.length > 0,
        createdAt: submission.createdAt,
      })),
    }
  }

  async createFeedback(
    userId: number,
    projectId: number,
    versionId: number,
    dto: CreateFeedbackDto,
  ): Promise<CreateFeedbackResponseDto> {
    await this.assertCanCreateFeedback(userId)

    const targetVersion = await this.prisma.projectVersion.findFirst({
      where: {
        id: versionId,
        projectId,
      },
      select: {
        feedbackQuestions: {
          select: {
            id: true,
            category: true,
            isRequired: true,
          },
        },
      },
    })

    if (!targetVersion) {
      throw new EntityNotExistException('projectVersion')
    }

    // 최신 버전만 피드백 작성 가능하도록 검증
    const latestVersion = await this.prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })

    if (!latestVersion || latestVersion.id !== versionId) {
      throw new UnprocessableDataException(
        'Feedback can only be submitted for the latest version',
      )
    }

    // 유저 × 버전 중복 제출 방지 (DB unique 제약과 이중 방어)
    const existingSubmission = await this.prisma.feedbackSubmission.findUnique({
      where: { versionId_userId: { versionId, userId } },
      select: { id: true },
    })
    if (existingSubmission) {
      throw new DuplicateFoundException('FeedbackSubmission')
    }

    const validQuestionIds = new Set(
      targetVersion.feedbackQuestions.map((q) => q.id),
    )
    const requiredQuestionIds = targetVersion.feedbackQuestions
      .filter((q) => q.isRequired)
      .map((q) => q.id)

    const submittedQuestionIds = dto.feedbacks.map((f) => f.questionId)
    const submittedQuestionSet = new Set(submittedQuestionIds)

    if (submittedQuestionIds.length === 0) {
      throw new UnprocessableDataException('Feedback must include answers')
    }

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

    const submittedCategories = new Set(
      targetVersion.feedbackQuestions
        .filter((q) => submittedQuestionSet.has(q.id))
        .map((q) => q.category),
    )
    const questionCategoryById = new Map(
      targetVersion.feedbackQuestions.map((q) => [q.id, q.category]),
    )

    // 3. 제출한 직군 범위 안의 필수 질문이 모두 포함되었는지 확인
    const missingRequired = requiredQuestionIds.filter((id) => {
      const category = questionCategoryById.get(id)

      return (
        category !== undefined &&
        submittedCategories.has(category) &&
        !submittedQuestionSet.has(id)
      )
    })
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
          create: dto.feedbacks.map((f) => {
            const images = this.buildFeedbackImages(f.imageUrls, f.imageUrl)

            return {
              questionId: f.questionId,
              content: f.content,
              images:
                images.length > 0
                  ? {
                      create: images,
                    }
                  : undefined,
            }
          }),
        },
      },
      include: {
        feedbacks: {
          include: { images: { orderBy: { order: 'asc' } } },
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
          imageUrls: f.images.map((image) => image.url),
          createdAt: f.createdAt,
        })),
      },
    }
  }

  async findFeedbacksForVersion(
    projectId: number,
    versionId: number,
  ): Promise<CreateFeedbackResponseDto> {
    const submissions = await this.prisma.feedbackSubmission.findMany({
      where: { projectId, versionId },
      orderBy: { createdAt: 'desc' },
      include: {
        feedbacks: { include: { images: { orderBy: { order: 'asc' } } } },
      },
    })

    const feedbacks = submissions.flatMap((submission) =>
      submission.feedbacks.map((f) => ({
        id: f.id,
        questionId: f.questionId,
        versionId: submission.versionId,
        userId: submission.userId,
        content: f.content,
        imageUrl: f.images[0]?.url || null,
        imageUrls: f.images.map((i) => i.url),
        createdAt: f.createdAt,
      })),
    )

    return {
      success: true,
      data: {
        submittedCount: feedbacks.length,
        feedbacks,
      },
    }
  }

  async findAllQuestions(
    projectId: number,
    versionId: number,
  ): Promise<FeedbackQuestionsResponseDto> {
    //1. 해당 버전이 프로젝트에 존재하는지 확인하며 질문 가져오기
    const targetVersion = await this.prisma.projectVersion.findFirst({
      where: {
        id: versionId,
        projectId,
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

  private async assertCanCreateFeedback(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userRole: true },
    })

    if (!user || !FEEDBACK_ALLOWED_USER_ROLES.includes(user.userRole)) {
      throw new ForbiddenAccessException(
        'Only Sprout or Seeder users can create feedback.',
      )
    }
  }

  private buildFeedbackImages(
    imageUrls?: string[],
    legacyImageUrl?: string,
  ): FeedbackImageInput[] {
    const urls =
      imageUrls ??
      (legacyImageUrl && legacyImageUrl.trim() !== '' ? [legacyImageUrl] : [])

    if (urls.length > MAX_FEEDBACK_IMAGES_PER_ITEM) {
      throw new UnprocessableDataException(
        `Feedback item can include up to ${MAX_FEEDBACK_IMAGES_PER_ITEM} images`,
      )
    }

    return urls.map((url, order) => ({ url, order }))
  }
}
