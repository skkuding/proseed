import { JobType, RecordCategory, UserRole } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  InsufficientTicketException,
  UnprocessableDataException,
} from 'src/common/exceptions/business.exception'
import type { PrismaService } from '../prisma/prisma.service'
import type { StorageService } from '../storage/storage.service'
import { FeedbackService } from './feedback.service'

describe('FeedbackService', () => {
  let service: FeedbackService
  let prisma: {
    feedbackSubmission: {
      findUnique: jest.Mock
      findFirst: jest.Mock
      findMany: jest.Mock
      create: jest.Mock
    }
    projectRole: { findUnique: jest.Mock }
    projectVersion: { findFirst: jest.Mock }
    user: { findUnique: jest.Mock; update: jest.Mock }
    feedbackUnlock: { create: jest.Mock }
    $transaction: jest.Mock
  }
  let storage: { getSignedDownloadUrl: jest.Mock }

  beforeEach(() => {
    prisma = {
      feedbackSubmission: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      projectRole: { findUnique: jest.fn() },
      projectVersion: { findFirst: jest.fn() },
      user: { findUnique: jest.fn(), update: jest.fn() },
      feedbackUnlock: { create: jest.fn() },
      //$transaction(cb) → cb(tx)로 즉시 실행, tx는 prisma 자신을 대입
      $transaction: jest.fn((cb: (tx: typeof prisma) => Promise<unknown>) =>
        cb(prisma),
      ),
    }
    storage = {
      getSignedDownloadUrl: jest.fn((key: string) =>
        Promise.resolve(`signed:${key}`),
      ),
    }
    service = new FeedbackService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    )
  })

  describe('findFeedbackSubmissionDetail', () => {
    it('한 줄 평가와 질문별 답변을 질문 순서 및 presigned 이미지 URL로 반환한다', async () => {
      const createdAt = new Date('2026-07-15T00:00:00.000Z')
      prisma.feedbackSubmission.findUnique.mockResolvedValue({
        id: 10,
        userId: 1,
        projectId: 1,
        versionId: 2,
        oneLineReview: '좋은 프로젝트입니다.',
        createdAt,
        updatedAt: createdAt,
        user: {
          name: '피드백 작성자',
          profileImageUrl: 'profile-key',
          jobType: JobType.Developer,
        },
        feedbacks: [
          {
            id: 102,
            questionId: 12,
            content: '두 번째 답변',
            createdAt,
            updatedAt: createdAt,
            question: {
              category: RecordCategory.DEVELOPMENT,
              title: '두 번째 질문',
              description: '두 번째 질문 설명',
              order: 2,
            },
            images: [{ url: 'second-image-key', order: 0 }],
          },
          {
            id: 101,
            questionId: 11,
            content: '첫 번째 답변',
            createdAt,
            updatedAt: createdAt,
            question: {
              category: RecordCategory.PLAN,
              title: '첫 번째 질문',
              description: '첫 번째 질문 설명',
              order: 1,
            },
            images: [
              { url: 'first-image-key', order: 0 },
              { url: 'first-image-key-2', order: 1 },
            ],
          },
        ],
      })

      await expect(
        service.findFeedbackSubmissionDetail(1, 10),
      ).resolves.toEqual({
        success: true,
        data: {
          id: 10,
          projectId: 1,
          versionId: 2,
          oneLineReview: '좋은 프로젝트입니다.',
          author: {
            name: '피드백 작성자',
            profileImageUrl: 'profile-key',
            role: JobType.Developer,
          },
          createdAt,
          updatedAt: createdAt,
          feedbacks: [
            {
              id: 101,
              questionId: 11,
              category: RecordCategory.PLAN,
              questionTitle: '첫 번째 질문',
              questionContent: '첫 번째 질문 설명',
              content: '첫 번째 답변',
              imageUrls: ['signed:first-image-key', 'signed:first-image-key-2'],
              createdAt,
              updatedAt: createdAt,
            },
            {
              id: 102,
              questionId: 12,
              category: RecordCategory.DEVELOPMENT,
              questionTitle: '두 번째 질문',
              questionContent: '두 번째 질문 설명',
              content: '두 번째 답변',
              imageUrls: ['signed:second-image-key'],
              createdAt,
              updatedAt: createdAt,
            },
          ],
        },
      })
      expect(storage.getSignedDownloadUrl).toHaveBeenCalledTimes(3)
    })

    it('제출 묶음이 없으면 404 BusinessException을 던진다', async () => {
      prisma.feedbackSubmission.findUnique.mockResolvedValue(null)

      await expect(
        service.findFeedbackSubmissionDetail(1, 999),
      ).rejects.toThrow(EntityNotExistException)
    })

    it('작성자가 아니지만 프로젝트 팀원일 경우 접근 허용', async () => {
      const createdAt = new Date('2026-07-15T00:00:00.000Z')
      prisma.feedbackSubmission.findUnique.mockResolvedValue({
        id: 20,
        userId: 10,
        projectId: 2,
        versionId: 3,
        oneLineReview: '코멘트',
        createdAt,
        updatedAt: createdAt,
        user: {
          name: '작성자',
          profileImageUrl: 'profile-key',
          jobType: JobType.Designer,
        },
        feedbacks: [],
      })
      prisma.projectRole.findUnique.mockResolvedValue({ id: 1 })

      await expect(
        service.findFeedbackSubmissionDetail(2, 20),
      ).resolves.toHaveProperty('success')
    })

    it('작성자도 아니고 팀원도 아니면 권한 예외를 던진다', async () => {
      const createdAt = new Date('2026-07-15T00:00:00.000Z')
      prisma.feedbackSubmission.findUnique.mockResolvedValue({
        id: 30,
        userId: 11,
        projectId: 3,
        versionId: 4,
        oneLineReview: '코멘트',
        createdAt,
        updatedAt: createdAt,
        user: {
          name: '작성자',
          profileImageUrl: 'profile-key',
          jobType: JobType.Designer,
        },
        feedbacks: [],
      })
      prisma.projectRole.findUnique.mockResolvedValue(null)

      await expect(
        service.findFeedbackSubmissionDetail(2, 30),
      ).rejects.toThrow()
    })
  })

  describe('findFeedbacksForVersion', () => {
    it('제출마다 submissionId/작성자/한줄평을 함께 실어 질문 순서대로 답변을 반환한다', async () => {
      const createdAt = new Date('2026-07-20T00:00:00.000Z')
      prisma.feedbackSubmission.findMany.mockResolvedValue([
        {
          id: 10,
          userId: 7,
          oneLineReview: '전체적으로 좋습니다.',
          adoptions: [],
          unlocks: [
            { category: RecordCategory.PLAN },
            { category: RecordCategory.DEVELOPMENT },
          ],
          user: {
            name: '피드백 작성자',
            profileImageUrl: 'profile-key',
            jobType: JobType.Developer,
          },
          feedbacks: [
            {
              id: 102,
              questionId: 12,
              content: '두 번째 답변',
              createdAt,
              updatedAt: createdAt,
              question: {
                category: RecordCategory.DEVELOPMENT,
                title: '두 번째 질문',
                description: '두 번째 질문 설명',
                order: 2,
              },
              images: [{ url: 'second-image-key', order: 0 }],
            },
            {
              id: 101,
              questionId: 11,
              content: '첫 번째 답변',
              createdAt,
              updatedAt: createdAt,
              question: {
                category: RecordCategory.PLAN,
                title: '첫 번째 질문',
                description: '첫 번째 질문 설명',
                order: 1,
              },
              images: [],
            },
          ],
        },
      ])

      await expect(service.findFeedbacksForVersion(1, 20, 99)).resolves.toEqual(
        {
          success: true,
          data: [
            {
              id: 101,
              submissionId: 10,
              userId: 7,
              questionId: 11,
              category: RecordCategory.PLAN,
              questionTitle: '첫 번째 질문',
              questionContent: '첫 번째 질문 설명',
              author: {
                name: '피드백 작성자',
                profileImageUrl: 'profile-key',
                role: JobType.Developer,
              },
              oneLineReview: '전체적으로 좋습니다.',
              isAdopted: false,
              isUnlocked: true,
              content: '첫 번째 답변',
              imageUrls: [],
              createdAt,
              updatedAt: createdAt,
            },
            {
              id: 102,
              submissionId: 10,
              userId: 7,
              questionId: 12,
              category: RecordCategory.DEVELOPMENT,
              questionTitle: '두 번째 질문',
              questionContent: '두 번째 질문 설명',
              author: {
                name: '피드백 작성자',
                profileImageUrl: 'profile-key',
                role: JobType.Developer,
              },
              oneLineReview: '전체적으로 좋습니다.',
              isAdopted: false,
              isUnlocked: true,
              content: '두 번째 답변',
              imageUrls: ['signed:second-image-key'],
              createdAt,
              updatedAt: createdAt,
            },
          ],
        },
      )
    })

    it('열람되지 않은 제출은 content를 비우고 imageUrls를 []로 내려준다 (isUnlocked=false)', async () => {
      const createdAt = new Date('2026-07-20T00:00:00.000Z')
      prisma.feedbackSubmission.findMany.mockResolvedValue([
        {
          id: 11,
          userId: 8,
          oneLineReview: '한줄평은 잠겨도 보인다.',
          adoptions: [],
          unlocks: [], //잠김
          user: {
            name: '작성자',
            profileImageUrl: 'profile-key',
            jobType: JobType.Planner,
          },
          feedbacks: [
            {
              id: 201,
              questionId: 21,
              content: '숨겨져야 하는 본문',
              createdAt,
              updatedAt: createdAt,
              question: {
                category: RecordCategory.PLAN,
                title: '질문',
                description: '질문 설명',
                order: 1,
              },
              images: [{ url: 'secret-image-key', order: 0 }],
            },
          ],
        },
      ])

      const result = await service.findFeedbacksForVersion(1, 20, 99)
      const item = result.data[0]
      expect(item.isUnlocked).toBe(false)
      expect(item.content).toBe('')
      expect(item.imageUrls).toEqual([])
      //잠긴 본문/이미지는 presign도 시도하지 않는다
      expect(storage.getSignedDownloadUrl).not.toHaveBeenCalled()
      //질문·작성자·한줄평은 잠겨도 노출
      expect(item.questionTitle).toBe('질문')
      expect(item.oneLineReview).toBe('한줄평은 잠겨도 보인다.')
    })

    it('같은 제출이 다른 직군에서 unlock돼도 unlock 안 된 직군은 잠긴 채로 내려간다', async () => {
      const createdAt = new Date('2026-07-20T00:00:00.000Z')
      prisma.feedbackSubmission.findMany.mockResolvedValue([
        {
          id: 12,
          userId: 9,
          oneLineReview: '한줄평',
          adoptions: [],
          unlocks: [{ category: RecordCategory.DEVELOPMENT }], //개발만 열림
          user: {
            name: '작성자',
            profileImageUrl: 'profile-key',
            jobType: JobType.Developer,
          },
          feedbacks: [
            {
              id: 301,
              questionId: 31,
              content: '개발 답변',
              createdAt,
              updatedAt: createdAt,
              question: {
                category: RecordCategory.DEVELOPMENT,
                title: '개발 질문',
                description: '설명',
                order: 1,
              },
              images: [],
            },
            {
              id: 302,
              questionId: 32,
              content: '디자인 답변',
              createdAt,
              updatedAt: createdAt,
              question: {
                category: RecordCategory.DESIGN,
                title: '디자인 질문',
                description: '설명',
                order: 2,
              },
              images: [],
            },
          ],
        },
      ])

      const result = await service.findFeedbacksForVersion(1, 20, 99)
      const dev = result.data.find(
        (d) => d.category === RecordCategory.DEVELOPMENT,
      )
      const design = result.data.find(
        (d) => d.category === RecordCategory.DESIGN,
      )
      expect(dev?.isUnlocked).toBe(true)
      expect(dev?.content).toBe('개발 답변')
      expect(design?.isUnlocked).toBe(false)
      expect(design?.content).toBe('')
    })

    it('본인이 작성한 답변은 unlock 여부와 무관하게 항상 노출된다', async () => {
      const createdAt = new Date('2026-07-20T00:00:00.000Z')
      prisma.feedbackSubmission.findMany.mockResolvedValue([
        {
          id: 13,
          userId: 42, //조회자 본인
          oneLineReview: '한줄평',
          adoptions: [],
          unlocks: [], //아무도 unlock 안 함
          user: {
            name: '나',
            profileImageUrl: 'profile-key',
            jobType: JobType.Planner,
          },
          feedbacks: [
            {
              id: 401,
              questionId: 41,
              content: '내가 쓴 답변',
              createdAt,
              updatedAt: createdAt,
              question: {
                category: RecordCategory.PLAN,
                title: '질문',
                description: '설명',
                order: 1,
              },
              images: [],
            },
          ],
        },
      ])

      const result = await service.findFeedbacksForVersion(1, 20, 42)
      expect(result.data[0].isUnlocked).toBe(true)
      expect(result.data[0].content).toBe('내가 쓴 답변')
    })

    it('viewerId가 없으면(비로그인) 본인 판별 없이 unlock 여부로만 게이팅한다', async () => {
      const createdAt = new Date('2026-07-20T00:00:00.000Z')
      prisma.feedbackSubmission.findMany.mockResolvedValue([
        {
          id: 14,
          userId: 42,
          oneLineReview: '한줄평',
          adoptions: [],
          unlocks: [],
          user: {
            name: '나',
            profileImageUrl: 'profile-key',
            jobType: JobType.Planner,
          },
          feedbacks: [
            {
              id: 501,
              questionId: 51,
              content: '숨겨져야 하는 답변',
              createdAt,
              updatedAt: createdAt,
              question: {
                category: RecordCategory.PLAN,
                title: '질문',
                description: '설명',
                order: 1,
              },
              images: [],
            },
          ],
        },
      ])

      const result = await service.findFeedbacksForVersion(1, 20)
      expect(result.data[0].isUnlocked).toBe(false)
      expect(result.data[0].content).toBe('')
    })

    it('제출이 없으면 빈 목록을 반환한다', async () => {
      prisma.feedbackSubmission.findMany.mockResolvedValue([])

      await expect(service.findFeedbacksForVersion(1, 20)).resolves.toEqual({
        success: true,
        data: [],
      })
    })
  })

  describe('unlockFeedback', () => {
    const asMember = () =>
      prisma.projectRole.findUnique.mockResolvedValue({ id: 1 })

    it('프로젝트 멤버가 아니면 403, 티켓을 차감하지 않는다', async () => {
      prisma.projectRole.findUnique.mockResolvedValue(null)

      await expect(
        service.unlockFeedback(5, 1, 2, 10, RecordCategory.PLAN),
      ).rejects.toThrow(ForbiddenAccessException)
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('제출이 프로젝트/버전에 없으면 404', async () => {
      asMember()
      prisma.feedbackSubmission.findFirst.mockResolvedValue(null)

      await expect(
        service.unlockFeedback(5, 1, 2, 999, RecordCategory.PLAN),
      ).rejects.toThrow(EntityNotExistException)
    })

    it('이미 열린 (제출, 직군)은 재과금 없이 멱등 응답 (charged=false)', async () => {
      asMember()
      prisma.feedbackSubmission.findFirst.mockResolvedValue({
        id: 10,
        unlocks: [{ id: 1 }],
      })
      prisma.user.findUnique.mockResolvedValue({ ownedTicketCount: 4 })

      await expect(
        service.unlockFeedback(5, 1, 2, 10, RecordCategory.PLAN),
      ).resolves.toEqual({
        success: true,
        data: {
          submissionId: 10,
          category: RecordCategory.PLAN,
          isUnlocked: true,
          charged: false,
          remainingTickets: 4,
        },
      })
      expect(prisma.$transaction).not.toHaveBeenCalled()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('다른 직군이 이미 열려 있어도 이번 직군은 별도로 과금된다', async () => {
      asMember()
      //findFirst의 unlocks select는 category로 필터되므로, 다른 직군만 열려 있으면 빈 배열이 온다
      prisma.feedbackSubmission.findFirst.mockResolvedValue({
        id: 10,
        unlocks: [],
      })
      prisma.user.findUnique.mockResolvedValue({ ownedTicketCount: 3 })
      prisma.feedbackUnlock.create.mockResolvedValue({ id: 78 })
      prisma.user.update.mockResolvedValue({ ownedTicketCount: 2 })

      await expect(
        service.unlockFeedback(5, 1, 2, 10, RecordCategory.DESIGN),
      ).resolves.toEqual({
        success: true,
        data: {
          submissionId: 10,
          category: RecordCategory.DESIGN,
          isUnlocked: true,
          charged: true,
          remainingTickets: 2,
        },
      })
      expect(prisma.feedbackUnlock.create).toHaveBeenCalledWith({
        data: {
          submissionId: 10,
          category: RecordCategory.DESIGN,
          unlockedById: 5,
        },
      })
    })

    it('티켓 잔액이 부족하면 InsufficientTicketException(422, code) + unlock 미생성', async () => {
      asMember()
      prisma.feedbackSubmission.findFirst.mockResolvedValue({
        id: 10,
        unlocks: [],
      })
      prisma.user.findUnique.mockResolvedValue({ ownedTicketCount: 0 })

      await expect(
        service.unlockFeedback(5, 1, 2, 10, RecordCategory.PLAN),
      ).rejects.toThrow(InsufficientTicketException)
      //응답 body에 안정 code가 실려 FE가 문자열 매칭 없이 구분 가능
      const httpBody = new InsufficientTicketException()
        .convert2HTTPException()
        .getResponse()
      expect(httpBody).toMatchObject({
        statusCode: 422,
        code: 'INSUFFICIENT_TICKET',
      })
      expect(prisma.feedbackUnlock.create).not.toHaveBeenCalled()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('성공 시 unlock 기록 생성 + 티켓 1개 차감 (charged=true) 후 잔액 반환', async () => {
      asMember()
      prisma.feedbackSubmission.findFirst.mockResolvedValue({
        id: 10,
        unlocks: [],
      })
      prisma.user.findUnique.mockResolvedValue({ ownedTicketCount: 3 })
      prisma.feedbackUnlock.create.mockResolvedValue({ id: 77 })
      prisma.user.update.mockResolvedValue({ ownedTicketCount: 2 })

      await expect(
        service.unlockFeedback(5, 1, 2, 10, RecordCategory.PLAN),
      ).resolves.toEqual({
        success: true,
        data: {
          submissionId: 10,
          category: RecordCategory.PLAN,
          isUnlocked: true,
          charged: true,
          remainingTickets: 2,
        },
      })
      expect(prisma.feedbackUnlock.create).toHaveBeenCalledWith({
        data: {
          submissionId: 10,
          category: RecordCategory.PLAN,
          unlockedById: 5,
        },
      })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { ownedTicketCount: { decrement: 1 } },
        select: { ownedTicketCount: true },
      })
    })
  })

  describe('createFeedback', () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({ userRole: UserRole.Sprout })
      prisma.feedbackSubmission.findUnique.mockResolvedValue(null)
    })

    it('제출한 직군의 필수 질문만 충족하면 피드백을 생성한다', async () => {
      const createdAt = new Date('2026-07-15T00:00:00.000Z')
      prisma.projectVersion.findFirst
        .mockResolvedValueOnce({
          feedbackQuestions: [
            {
              id: 1,
              category: RecordCategory.PLAN,
              isRequired: true,
            },
            {
              id: 2,
              category: RecordCategory.DEVELOPMENT,
              isRequired: true,
            },
            {
              id: 3,
              category: RecordCategory.DEVELOPMENT,
              isRequired: false,
            },
            {
              id: 4,
              category: RecordCategory.DESIGN,
              isRequired: true,
            },
          ],
        })
        .mockResolvedValueOnce({ id: 20 })
      prisma.feedbackSubmission.create.mockResolvedValue({
        versionId: 20,
        userId: 10,
        feedbacks: [
          {
            id: 100,
            questionId: 2,
            content: '개발 직군 답변',
            images: [],
            createdAt,
          },
        ],
      })

      await expect(
        service.createFeedback(10, 1, 20, {
          oneLineReview: '좋았습니다.',
          feedbacks: [{ questionId: 2, content: '개발 직군 답변' }],
        }),
      ).resolves.toEqual({
        success: true,
        data: {
          submittedCount: 1,
          feedbacks: [
            {
              id: 100,
              questionId: 2,
              versionId: 20,
              userId: 10,
              content: '개발 직군 답변',
              imageUrl: null,
              imageUrls: [],
              createdAt,
            },
          ],
        },
      })
      expect(prisma.feedbackSubmission.create).toHaveBeenCalled()
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { ownedTicketCount: { increment: 2 } },
      })
    })

    it('제출한 직군 안의 필수 질문이 빠지면 예외를 던진다', async () => {
      prisma.projectVersion.findFirst
        .mockResolvedValueOnce({
          feedbackQuestions: [
            {
              id: 2,
              category: RecordCategory.DEVELOPMENT,
              isRequired: true,
            },
            {
              id: 3,
              category: RecordCategory.DEVELOPMENT,
              isRequired: false,
            },
          ],
        })
        .mockResolvedValueOnce({ id: 20 })

      await expect(
        service.createFeedback(10, 1, 20, {
          oneLineReview: '좋았습니다.',
          feedbacks: [{ questionId: 3, content: '선택 질문 답변' }],
        }),
      ).rejects.toThrow(UnprocessableDataException)
      expect(prisma.feedbackSubmission.create).not.toHaveBeenCalled()
    })

    it('GENERAL 필수 질문은 답변한 직군과 관계없이 누락 시 예외를 던진다', async () => {
      prisma.projectVersion.findFirst
        .mockResolvedValueOnce({
          feedbackQuestions: [
            {
              id: 2,
              category: RecordCategory.DEVELOPMENT,
              isRequired: true,
            },
            {
              id: 5,
              category: RecordCategory.GENERAL,
              isRequired: true,
            },
          ],
        })
        .mockResolvedValueOnce({ id: 20 })

      await expect(
        service.createFeedback(10, 1, 20, {
          oneLineReview: '좋았습니다.',
          feedbacks: [{ questionId: 2, content: '개발 직군 답변' }],
        }),
      ).rejects.toThrow(UnprocessableDataException)
      expect(prisma.feedbackSubmission.create).not.toHaveBeenCalled()
    })

    it('feedbacks가 없으면 서비스 레벨에서 예외를 던진다', async () => {
      prisma.projectVersion.findFirst
        .mockResolvedValueOnce({
          feedbackQuestions: [
            {
              id: 2,
              category: RecordCategory.DEVELOPMENT,
              isRequired: true,
            },
          ],
        })
        .mockResolvedValueOnce({ id: 20 })

      await expect(
        service.createFeedback(10, 1, 20, {
          oneLineReview: '좋았습니다.',
          feedbacks: undefined,
        } as never),
      ).rejects.toThrow(UnprocessableDataException)
      expect(prisma.feedbackSubmission.create).not.toHaveBeenCalled()
    })
  })
})

type MockFn = jest.Mock

describe('getRecentFeedbacks — mainpage 최근 피드백 (채택/unlock 여부 무관)', () => {
  let service: FeedbackService
  let prisma: {
    feedbackSubmission: { findMany: MockFn }
  }
  let storage: { getSignedDownloadUrl: MockFn }

  const buildSubmission = (
    id: number,
    createdAt: Date,
    feedbacks: {
      content: string
      question: { category: RecordCategory } | null
      category?: RecordCategory | null
    }[],
    projectIconUrl = 'icon-key',
    versionId: number | null = 100 + id,
  ) => ({
    id,
    versionId,
    createdAt,
    oneLineReview: `review-${id}`,
    user: { name: `user-${id}`, profileImageUrl: '/profile.svg' },
    project: { id: 10, title: 'project', iconUrl: projectIconUrl },
    feedbacks: feedbacks.map((f) => ({ category: null, ...f })),
  })

  beforeEach(() => {
    prisma = {
      feedbackSubmission: { findMany: jest.fn().mockResolvedValue([]) },
    }
    storage = {
      getSignedDownloadUrl: jest.fn().mockResolvedValue('signed-icon-url'),
    }
    service = new FeedbackService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    )
  })

  it('제출이 없으면 빈 목록을 반환한다', async () => {
    const result = await service.getRecentFeedbacks(6)

    expect(result).toEqual({ success: true, data: [] })
    expect(storage.getSignedDownloadUrl).not.toHaveBeenCalled()
  })

  it('제출×직군 단위로 카드를 만들고 해당 직군 첫 답변을 본문으로 쓴다 (채택 여부 무관)', async () => {
    prisma.feedbackSubmission.findMany.mockResolvedValue([
      buildSubmission(1, new Date('2026-08-04T00:00:00Z'), [
        {
          content: 'plan-answer-1',
          question: { category: RecordCategory.PLAN },
        },
        {
          content: 'plan-answer-2',
          question: { category: RecordCategory.PLAN },
        },
        {
          content: 'design-answer',
          question: { category: RecordCategory.DESIGN },
        },
      ]),
    ])

    const result = await service.getRecentFeedbacks(6)

    expect(result.data).toEqual([
      {
        submissionId: 1,
        versionId: 101,
        category: RecordCategory.PLAN,
        nickname: 'user-1',
        profileImageUrl: '/profile.svg',
        oneLineReview: 'review-1',
        content: 'plan-answer-1',
        projectId: 10,
        projectName: 'project',
        projectIconUrl: 'signed-icon-url',
      },
      {
        submissionId: 1,
        versionId: 101,
        category: RecordCategory.DESIGN,
        nickname: 'user-1',
        profileImageUrl: '/profile.svg',
        oneLineReview: 'review-1',
        content: 'design-answer',
        projectId: 10,
        projectName: 'project',
        projectIconUrl: 'signed-icon-url',
      },
    ])
    //채택(FeedbackAdoption) 여부와 무관하게 (자유 피드백 포함) 최근 제출을 전부 조회 — where절 없이 전체 조회
    expect(prisma.feedbackSubmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        take: 24,
      }),
    )
  })

  it('최신 제출 순으로 정렬하고 take만큼만 슬라이스한다, 같은 아이콘은 presign 1회', async () => {
    prisma.feedbackSubmission.findMany.mockResolvedValue([
      buildSubmission(
        2,
        new Date('2026-08-04T00:00:00Z'),
        [
          {
            content: 'design-answer',
            question: { category: RecordCategory.DESIGN },
          },
        ],
        'same-key',
      ),
      buildSubmission(
        1,
        new Date('2026-08-03T00:00:00Z'),
        [
          {
            content: 'plan-answer',
            question: { category: RecordCategory.PLAN },
          },
        ],
        'same-key',
      ),
    ])

    const result = await service.getRecentFeedbacks(1)

    expect(result.data).toEqual([
      {
        submissionId: 2,
        versionId: 102,
        category: RecordCategory.DESIGN,
        nickname: 'user-2',
        profileImageUrl: '/profile.svg',
        oneLineReview: 'review-2',
        content: 'design-answer',
        projectId: 10,
        projectName: 'project',
        projectIconUrl: 'signed-icon-url',
      },
    ])
    expect(storage.getSignedDownloadUrl).toHaveBeenCalledTimes(1)
  })

  it('성장기록(버전) 없이 남긴 자유 피드백도 포함한다 — question이 없으면 답변의 category를 쓴다', async () => {
    prisma.feedbackSubmission.findMany.mockResolvedValue([
      buildSubmission(
        1,
        new Date('2026-08-04T00:00:00Z'),
        [
          {
            content: 'freeform-answer',
            question: null,
            category: RecordCategory.GENERAL,
          },
        ],
        'icon-key',
        null,
      ),
    ])

    const result = await service.getRecentFeedbacks(6)

    expect(result.data).toEqual([
      {
        submissionId: 1,
        versionId: 0,
        category: RecordCategory.GENERAL,
        nickname: 'user-1',
        profileImageUrl: '/profile.svg',
        oneLineReview: 'review-1',
        content: 'freeform-answer',
        projectId: 10,
        projectName: 'project',
        projectIconUrl: 'signed-icon-url',
      },
    ])
  })

  it('question도 category도 없는 답변은 건너뛴다', async () => {
    prisma.feedbackSubmission.findMany.mockResolvedValue([
      buildSubmission(1, new Date('2026-08-04T00:00:00Z'), [
        { content: 'no-question-no-category', question: null },
      ]),
    ])

    const result = await service.getRecentFeedbacks(6)

    expect(result).toEqual({ success: true, data: [] })
  })
})
