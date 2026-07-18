import { JobType, RecordCategory, UserRole } from '@prisma/client'
import {
  EntityNotExistException,
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
      findMany: jest.Mock
      create: jest.Mock
    }
    projectRole: { findUnique: jest.Mock }
    projectVersion: { findFirst: jest.Mock }
    user: { findUnique: jest.Mock }
  }
  let storage: { getSignedDownloadUrl: jest.Mock }

  beforeEach(() => {
    prisma = {
      feedbackSubmission: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      projectRole: { findUnique: jest.fn() },
      projectVersion: { findFirst: jest.fn() },
      user: { findUnique: jest.fn() },
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
  })
})
