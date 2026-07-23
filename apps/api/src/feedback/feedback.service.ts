import { Injectable } from '@nestjs/common'
import { Prisma, RecordCategory, UserRole } from '@prisma/client'
import {
  CreateFeedbackDto,
  MAX_FEEDBACK_IMAGES_PER_ITEM,
} from './dto/create-feedback.dto'
import {
  CreateFeedbackResponseDto,
  FeedbackSubmissionDetailResponseDto,
  FeedbackQuestionsResponseDto,
  FeedbackListResponseDto,
  MyFeedbackProjectsResponseDto,
  RecentFeedbacksResponseDto,
  UnlockFeedbackResponseDto,
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

//피드백 제출 하나를 열람하는 데 드는 티켓 수
const UNLOCK_COST = 1

type FeedbackImageInput = { url: string; order: number }

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * mainpage 최근 피드백 — 채택(FeedbackAdoption)된 제출만 공개 (본문 게이팅 정책과 정합).
   * 카드 단위 = 채택(제출×직군), 본문 = 해당 직군 질문에 대한 첫 답변.
   */
  async getRecentFeedbacks(take: number): Promise<RecentFeedbacksResponseDto> {
    const adoptions = await this.prisma.feedbackAdoption.findMany({
      orderBy: { id: 'desc' },
      take,
      select: {
        submissionId: true,
        growthRecord: { select: { category: true } },
        submission: {
          select: {
            versionId: true,
            oneLineReview: true,
            user: { select: { name: true, profileImageUrl: true } },
            project: { select: { id: true, title: true, iconUrl: true } },
          },
        },
      },
    })

    if (adoptions.length === 0) {
      return { success: true, data: [] }
    }

    //채택 직군의 첫 답변을 카드 본문으로 사용 — (제출, 직군) 쌍 단위로 정확히 조회
    const answers = await this.prisma.feedback.findMany({
      where: {
        OR: adoptions.map((a) => ({
          submissionId: a.submissionId,
          question: { category: a.growthRecord.category },
        })),
      },
      orderBy: [{ question: { order: 'asc' } }, { id: 'asc' }],
      select: {
        submissionId: true,
        content: true,
        question: { select: { category: true } },
      },
    })

    const firstAnswerByKey = new Map<string, string>()
    for (const answer of answers) {
      const key = `${answer.submissionId}:${answer.question.category}`
      if (!firstAnswerByKey.has(key)) {
        firstAnswerByKey.set(key, answer.content)
      }
    }

    //프로젝트 아이콘 S3 key → presigned URL (중복 프로젝트는 1회만 변환)
    const iconUrlByKey = new Map<string, string>()
    await Promise.all(
      [...new Set(adoptions.map((a) => a.submission.project.iconUrl))].map(
        async (key) => {
          iconUrlByKey.set(key, await this.storage.getSignedDownloadUrl(key))
        },
      ),
    )

    const data = adoptions.map((adoption) => ({
      submissionId: adoption.submissionId,
      versionId: adoption.submission.versionId,
      category: adoption.growthRecord.category,
      nickname: adoption.submission.user.name,
      profileImageUrl: adoption.submission.user.profileImageUrl,
      oneLineReview: adoption.submission.oneLineReview,
      content:
        firstAnswerByKey.get(
          `${adoption.submissionId}:${adoption.growthRecord.category}`,
        ) ?? '',
      projectId: adoption.submission.project.id,
      projectName: adoption.submission.project.title,
      projectIconUrl:
        iconUrlByKey.get(adoption.submission.project.iconUrl) ??
        adoption.submission.project.iconUrl,
    }))

    return { success: true, data }
  }

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
        versionId: true,
        createdAt: true,
        adoptions: {
          select: { id: true },
          take: 1,
        },
        project: {
          select: {
            id: true,
            title: true,
            iconUrl: true,
            oneLineDescription: true,
          },
        },
      },
    })

    //프로젝트 아이콘 S3 key → presigned URL (중복 프로젝트는 1회만 변환)
    const iconUrlByKey = new Map<string, string>()
    await Promise.all(
      [...new Set(submissions.map((s) => s.project.iconUrl))].map(
        async (key) => {
          iconUrlByKey.set(key, await this.storage.getSignedDownloadUrl(key))
        },
      ),
    )

    return {
      success: true,
      data: submissions.map((submission) => ({
        submissionId: submission.id,
        versionId: submission.versionId,
        projectId: submission.project.id,
        projectTitle: submission.project.title,
        projectIconUrl:
          iconUrlByKey.get(submission.project.iconUrl) ??
          submission.project.iconUrl,
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

    if (!Array.isArray(dto.feedbacks) || dto.feedbacks.length === 0) {
      throw new UnprocessableDataException('Feedback must include answers')
    }

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
        (category === RecordCategory.GENERAL ||
          submittedCategories.has(category)) &&
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

  //제출(submission) 단위 그룹핑에 필요한 submissionId/작성자/한줄평을 답변마다 함께 내려줌.
  //열람(unlock) 안 된 제출은 content/imageUrls를 서버에서 비워서 내려줌 (FE 블러가 아닌 실제 게이팅).
  async findFeedbacksForVersion(
    projectId: number,
    versionId: number,
  ): Promise<FeedbackListResponseDto> {
    const submissions = await this.prisma.feedbackSubmission.findMany({
      where: { projectId, versionId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        oneLineReview: true,
        adoptions: { select: { id: true }, take: 1 },
        unlocks: { select: { id: true }, take: 1 },
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

    const data = await Promise.all(
      submissions.flatMap((submission) => {
        const isUnlocked = submission.unlocks.length > 0
        return submission.feedbacks
          .sort((a, b) => a.question.order - b.question.order)
          .map(async (feedback) => ({
            id: feedback.id,
            submissionId: submission.id,
            userId: submission.userId,
            questionId: feedback.questionId,
            category: feedback.question.category,
            questionTitle: feedback.question.title,
            questionContent: feedback.question.description,
            author: {
              name: submission.user.name,
              profileImageUrl: submission.user.profileImageUrl,
              role: submission.user.jobType,
            },
            oneLineReview: submission.oneLineReview,
            isAdopted: submission.adoptions.length > 0,
            isUnlocked,
            //잠긴 제출은 본문/이미지 제거 (질문·작성자·한줄평만 노출)
            content: isUnlocked ? feedback.content : '',
            imageUrls: isUnlocked
              ? await Promise.all(
                  feedback.images.map((image) =>
                    this.storage.getSignedDownloadUrl(image.url),
                  ),
                )
              : [],
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,
          }))
      }),
    )

    return { success: true, data }
  }

  /**
   * 피드백 제출 열람(unlock) — 프로젝트 멤버만, 티켓 1개 차감.
   * 제출 단위(전 직군 한 번에 열림). 전역 1회 공개 — 이미 열렸으면 무과금 멱등.
   */
  async unlockFeedback(
    userId: number,
    projectId: number,
    versionId: number,
    submissionId: number,
  ): Promise<UnlockFeedbackResponseDto> {
    //1. 프로젝트 멤버만 unlock 가능
    const member = await this.prisma.projectRole.findUnique({
      where: { userId_projectId: { userId, projectId } },
      select: { id: true },
    })
    if (!member) {
      throw new ForbiddenAccessException(
        'Only project members can unlock feedback.',
      )
    }

    //2. 제출이 이 프로젝트/버전에 속하는지
    const submission = await this.prisma.feedbackSubmission.findFirst({
      where: { id: submissionId, projectId, versionId },
      select: { id: true, unlocks: { select: { id: true }, take: 1 } },
    })
    if (!submission) {
      throw new EntityNotExistException('FeedbackSubmission')
    }

    //3. 이미 열려 있으면 재과금 없이 멱등 응답
    if (submission.unlocks.length > 0) {
      const me = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { ownedTicketCount: true },
      })
      return {
        success: true,
        data: {
          submissionId,
          isUnlocked: true,
          remainingTickets: me?.ownedTicketCount ?? 0,
        },
      }
    }

    //4. 트랜잭션: 잔액 확인 → unlock 기록 → 티켓 차감
    try {
      const remainingTickets = await this.prisma.$transaction(async (tx) => {
        const me = await tx.user.findUnique({
          where: { id: userId },
          select: { ownedTicketCount: true },
        })
        if (!me || me.ownedTicketCount < UNLOCK_COST) {
          throw new UnprocessableDataException(
            'Not enough tickets to unlock this feedback.',
          )
        }
        //unique(submissionId)로 동시 unlock은 한쪽만 성공 → 이중 과금 방지
        await tx.feedbackUnlock.create({
          data: { submissionId, unlockedById: userId },
        })
        const updated = await tx.user.update({
          where: { id: userId },
          data: { ownedTicketCount: { decrement: UNLOCK_COST } },
          select: { ownedTicketCount: true },
        })
        return updated.ownedTicketCount
      })

      return {
        success: true,
        data: { submissionId, isUnlocked: true, remainingTickets },
      }
    } catch (error) {
      //경합: 다른 요청이 방금 unlock함 → 무과금으로 이미 열림 처리
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const me = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { ownedTicketCount: true },
        })
        return {
          success: true,
          data: {
            submissionId,
            isUnlocked: true,
            remainingTickets: me?.ownedTicketCount ?? 0,
          },
        }
      }
      throw error
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
