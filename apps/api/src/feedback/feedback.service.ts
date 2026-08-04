import { Injectable } from '@nestjs/common'
import { Prisma, RecordCategory, UserRole } from '@prisma/client'
import {
  CreateFeedbackDto,
  CreateFreeformFeedbackDto,
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
  InsufficientTicketException,
  UnprocessableDataException,
} from 'src/common/exceptions/business.exception'

const FEEDBACK_ALLOWED_USER_ROLES: readonly UserRole[] = [
  UserRole.Sprout,
  UserRole.Seeder,
]

//피드백 제출 하나를 열람하는 데 드는 티켓 수
const UNLOCK_COST = 1

//피드백 작성 보상 (티켓 정책 확정)
const FEEDBACK_WRITE_REWARD = 2

//성장기록(버전) 없이 남기는 자유 피드백의 고정 질문 문구
const FREEFORM_FEEDBACK_TITLE = '자유롭게 피드백을 남겨주세요'

type FeedbackImageInput = { url: string; order: number }

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * mainpage 최근 피드백 — 채택/unlock 여부와 무관하게 최근 제출 전체 공개 (PM 확정, 2026-08-04).
   * 성장기록(버전) 없이 남긴 자유 피드백도 포함한다. 카드 단위 = 제출×직군, 본문 = 해당 직군의 첫 답변.
   */
  async getRecentFeedbacks(take: number): Promise<RecentFeedbacksResponseDto> {
    // 제출 하나가 최대 4개 직군에 답할 수 있어, 카드 수 확보를 위해 여유 있게 조회 후 슬라이스
    const submissions = await this.prisma.feedbackSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: take * 4,
      select: {
        id: true,
        versionId: true,
        createdAt: true,
        oneLineReview: true,
        user: { select: { name: true, profileImageUrl: true } },
        project: { select: { id: true, title: true, iconUrl: true } },
        feedbacks: {
          orderBy: [{ question: { order: 'asc' } }, { id: 'asc' }],
          select: {
            content: true,
            // 자유 피드백은 question이 없어 답변에 기록된 category를 대신 쓴다
            category: true,
            question: { select: { category: true } },
          },
        },
      },
    })

    type Card = {
      submissionId: number
      versionId: number
      category: RecordCategory
      createdAt: Date
      nickname: string
      profileImageUrl: string
      oneLineReview: string
      content: string
      projectId: number
      projectName: string
      projectIconKey: string
    }

    const cards: Card[] = []
    for (const submission of submissions) {
      // 직군별 첫 답변만 카드 본문으로 사용 (feedbacks는 question.order asc로 정렬돼 있음)
      const seenCategories = new Set<RecordCategory>()
      for (const answer of submission.feedbacks) {
        const category = answer.question?.category ?? answer.category
        if (!category || seenCategories.has(category)) {
          continue
        }
        seenCategories.add(category)

        cards.push({
          submissionId: submission.id,
          // 성장기록 없이 남긴 자유 피드백은 버전이 없으므로 0
          versionId: submission.versionId ?? 0,
          category,
          createdAt: submission.createdAt,
          nickname: submission.user.name,
          profileImageUrl: submission.user.profileImageUrl,
          oneLineReview: submission.oneLineReview,
          content: answer.content,
          projectId: submission.project.id,
          projectName: submission.project.title,
          projectIconKey: submission.project.iconUrl,
        })
      }
    }

    cards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const sliced = cards.slice(0, take)

    if (sliced.length === 0) {
      return { success: true, data: [] }
    }

    //프로젝트 아이콘 S3 key → presigned URL (중복 프로젝트는 1회만 변환)
    const iconUrlByKey = new Map<string, string>()
    await Promise.all(
      [...new Set(sliced.map((c) => c.projectIconKey))].map(async (key) => {
        iconUrlByKey.set(key, await this.storage.getSignedDownloadUrl(key))
      }),
    )

    const data = sliced.map((card) => ({
      submissionId: card.submissionId,
      versionId: card.versionId,
      category: card.category,
      nickname: card.nickname,
      profileImageUrl: card.profileImageUrl,
      oneLineReview: card.oneLineReview,
      content: card.content,
      projectId: card.projectId,
      projectName: card.projectName,
      projectIconUrl:
        iconUrlByKey.get(card.projectIconKey) ?? card.projectIconKey,
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
            category: true,
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
        .sort((a, b) => (a.question?.order ?? 0) - (b.question?.order ?? 0))
        .map(async (feedback) => ({
          id: feedback.id,
          // 성장기록 없이 남긴 자유 피드백은 실제 질문이 없으므로 0
          questionId: feedback.questionId ?? 0,
          // 성장기록 없이 남긴 자유 피드백은 question이 없으므로 답변에 기록된 category를 사용
          category: feedback.question?.category ?? feedback.category!,
          questionTitle: feedback.question?.title ?? FREEFORM_FEEDBACK_TITLE,
          questionContent: feedback.question?.description ?? '',
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
        // 성장기록 없이 남긴 자유 피드백은 버전이 없으므로 0
        versionId: submission.versionId ?? 0,
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
        // 성장기록 없이 남긴 자유 피드백은 버전이 없으므로 0
        versionId: submission.versionId ?? 0,
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

    // 제출 생성 + 작성 보상 지급을 하나의 트랜잭션으로
    const submission = await this.prisma.$transaction(async (tx) => {
      const created = await tx.feedbackSubmission.create({
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

      await tx.user.update({
        where: { id: userId },
        data: { ownedTicketCount: { increment: FEEDBACK_WRITE_REWARD } },
      })

      return created
    })

    return {
      success: true,
      data: {
        submittedCount: submission.feedbacks.length,
        feedbacks: submission.feedbacks.map((f) => ({
          id: f.id,
          questionId: f.questionId ?? 0,
          versionId: submission.versionId ?? 0,
          userId: submission.userId,
          content: f.content,
          imageUrl: f.images[0]?.url || null,
          imageUrls: f.images.map((image) => image.url),
          createdAt: f.createdAt,
        })),
      },
    }
  }

  //성장기록(버전)이 아직 없는 프로젝트용 피드백 — 한 줄 평가(oneLineReview)는 제출 전체에서 공유하고,
  //구조화된 질문(FeedbackQuestion) 없이 직군(category)별로 자유 텍스트 답변을 하나 이상 남긴다.
  async createFreeformFeedback(
    userId: number,
    projectId: number,
    dto: CreateFreeformFeedbackDto,
  ): Promise<CreateFeedbackResponseDto> {
    await this.assertCanCreateFeedback(userId)

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    })
    if (!project) {
      throw new EntityNotExistException('Project')
    }

    const submittedCategories = dto.feedbacks.map((f) => f.category)
    if (new Set(submittedCategories).size !== submittedCategories.length) {
      throw new UnprocessableDataException(
        'Duplicate feedback for the same category',
      )
    }

    // 버전이 없어 DB unique 제약을 못 쓰므로 유저 × 프로젝트 중복 제출을 애플리케이션에서 체크.
    // 자유 피드백은 프로젝트당 1회만 제출 가능 (그 1회 안에서 직군은 여러 개 선택 가능).
    const existingSubmission = await this.prisma.feedbackSubmission.findFirst({
      where: { projectId, userId, versionId: null },
      select: { id: true },
    })
    if (existingSubmission) {
      throw new DuplicateFoundException('FeedbackSubmission')
    }

    const submission = await this.prisma.$transaction(async (tx) => {
      const created = await tx.feedbackSubmission.create({
        data: {
          userId,
          projectId,
          versionId: null,
          oneLineReview: dto.oneLineReview,
          feedbacks: {
            create: dto.feedbacks.map((f) => {
              const images = this.buildFeedbackImages(f.imageUrls)

              return {
                questionId: null,
                category: f.category,
                content: f.content,
                images: images.length > 0 ? { create: images } : undefined,
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

      await tx.user.update({
        where: { id: userId },
        data: { ownedTicketCount: { increment: FEEDBACK_WRITE_REWARD } },
      })

      return created
    })

    return {
      success: true,
      data: {
        submittedCount: submission.feedbacks.length,
        feedbacks: submission.feedbacks.map((f) => ({
          id: f.id,
          questionId: f.questionId ?? 0,
          versionId: submission.versionId ?? 0,
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
  //열람(unlock)은 (제출, 직군) 단위 — 같은 제출이 여러 직군에 답했어도 직군별로 따로 열려야 함.
  //본인이 작성한 답변은 unlock/프로젝트 멤버십과 무관하게 항상 열람 가능.
  //versionId가 null이면 성장기록 없는 프로젝트의 자유 피드백 목록.
  async findFeedbacksForVersion(
    projectId: number,
    versionId: number | null,
    viewerId?: number,
  ): Promise<FeedbackListResponseDto> {
    const submissions = await this.prisma.feedbackSubmission.findMany({
      where: { projectId, versionId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        oneLineReview: true,
        adoptions: { select: { id: true }, take: 1 },
        unlocks: { select: { category: true } },
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
            category: true,
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
        const isAuthor =
          viewerId !== undefined && submission.userId === viewerId
        const unlockedCategories = new Set(
          submission.unlocks.map((u) => u.category),
        )
        return submission.feedbacks
          .sort((a, b) => (a.question?.order ?? 0) - (b.question?.order ?? 0))
          .map(async (feedback) => {
            // 성장기록 없이 남긴 자유 피드백은 question이 없으므로 답변에 기록된 category를 사용
            const feedbackCategory =
              feedback.question?.category ?? feedback.category!
            const isUnlocked =
              isAuthor || unlockedCategories.has(feedbackCategory)

            return {
              id: feedback.id,
              submissionId: submission.id,
              userId: submission.userId,
              questionId: feedback.questionId ?? 0,
              category: feedbackCategory,
              questionTitle:
                feedback.question?.title ?? FREEFORM_FEEDBACK_TITLE,
              questionContent: feedback.question?.description ?? '',
              author: {
                name: submission.user.name,
                profileImageUrl: submission.user.profileImageUrl,
                role: submission.user.jobType,
              },
              oneLineReview: submission.oneLineReview,
              isAdopted: submission.adoptions.length > 0,
              isUnlocked,
              //잠긴 직군 답변은 본문/이미지 제거 (질문·작성자·한줄평만 노출)
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
            }
          })
      }),
    )

    return { success: true, data }
  }

  /**
   * 피드백 제출의 특정 직군 답변 열람(unlock) — 프로젝트 멤버만, 티켓 1개 차감.
   * (제출, 직군) 단위 — 같은 제출이라도 다른 직군은 별도로 unlock해야 함.
   * 전역 1회 공개 — 이미 열렸으면 무과금 멱등. versionId가 null이면 자유 피드백(성장기록 없는 프로젝트) 대상 — 무료 열람 아님, 규칙 동일.
   */
  async unlockFeedback(
    userId: number,
    projectId: number,
    versionId: number | null,
    submissionId: number,
    category: RecordCategory,
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

    //2. 제출이 이 프로젝트/버전에 속하는지, 해당 직군이 이미 열려 있는지
    const submission = await this.prisma.feedbackSubmission.findFirst({
      where: { id: submissionId, projectId, versionId },
      select: {
        id: true,
        unlocks: { where: { category }, select: { id: true }, take: 1 },
      },
    })
    if (!submission) {
      throw new EntityNotExistException('FeedbackSubmission')
    }

    //3. 이미 열려 있으면 재과금 없이 멱등 응답 (charged=false)
    if (submission.unlocks.length > 0) {
      return this.alreadyUnlockedResponse(userId, submissionId, category)
    }

    //4. 트랜잭션: 잔액 확인 → unlock 기록 → 티켓 차감
    try {
      const remainingTickets = await this.prisma.$transaction(async (tx) => {
        const me = await tx.user.findUnique({
          where: { id: userId },
          select: { ownedTicketCount: true },
        })
        if (!me || me.ownedTicketCount < UNLOCK_COST) {
          throw new InsufficientTicketException(
            'Not enough tickets to unlock this feedback.',
          )
        }
        //unique(submissionId, category)로 동시 unlock은 한쪽만 성공 → 이중 과금 방지
        await tx.feedbackUnlock.create({
          data: { submissionId, category, unlockedById: userId },
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
        data: {
          submissionId,
          category,
          isUnlocked: true,
          charged: true,
          remainingTickets,
        },
      }
    } catch (error) {
      //경합: 다른 요청이 방금 unlock함 → 무과금(charged=false)으로 이미 열림 처리
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.alreadyUnlockedResponse(userId, submissionId, category)
      }
      throw error
    }
  }

  //이미 열려 있던 (제출, 직군) — 무과금(charged=false), 현재 잔액 그대로 반환
  private async alreadyUnlockedResponse(
    userId: number,
    submissionId: number,
    category: RecordCategory,
  ): Promise<UnlockFeedbackResponseDto> {
    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ownedTicketCount: true },
    })
    return {
      success: true,
      data: {
        submissionId,
        category,
        isUnlocked: true,
        charged: false,
        remainingTickets: me?.ownedTicketCount ?? 0,
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
