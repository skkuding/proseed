import { RecordCategory } from '@prisma/client'
import type { PrismaService } from '../prisma/prisma.service'
import type { StorageService } from '../storage/storage.service'
import { FeedbackService } from './feedback.service'

type MockFn = jest.Mock

describe('getRecentFeedbacks — mainpage 최근 피드백 (채택된 제출만)', () => {
  let service: FeedbackService
  let prisma: {
    feedbackAdoption: { findMany: MockFn }
    feedback: { findMany: MockFn }
  }
  let storage: { getSignedDownloadUrl: MockFn }

  const buildAdoption = (
    submissionId: number,
    category: RecordCategory,
    projectIconUrl = 'icon-key',
  ) => ({
    submissionId,
    growthRecord: { category },
    submission: {
      oneLineReview: `review-${submissionId}`,
      user: { name: `user-${submissionId}`, profileImageUrl: '/profile.svg' },
      project: { id: 10, title: 'project', iconUrl: projectIconUrl },
    },
  })

  beforeEach(() => {
    prisma = {
      feedbackAdoption: { findMany: jest.fn().mockResolvedValue([]) },
      feedback: { findMany: jest.fn().mockResolvedValue([]) },
    }
    storage = {
      getSignedDownloadUrl: jest.fn().mockResolvedValue('signed-icon-url'),
    }
    service = new FeedbackService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    )
  })

  it('채택이 없으면 빈 목록을 반환하고 답변 조회를 생략한다', async () => {
    const result = await service.getRecentFeedbacks(6)

    expect(result).toEqual({ success: true, data: [] })
    expect(prisma.feedback.findMany).not.toHaveBeenCalled()
  })

  it('채택(제출×직군) 단위로 카드를 만들고 해당 직군 첫 답변을 본문으로 쓴다', async () => {
    prisma.feedbackAdoption.findMany.mockResolvedValue([
      buildAdoption(1, RecordCategory.PLAN),
      buildAdoption(1, RecordCategory.DESIGN),
    ])
    //orderBy(question.order asc)로 정렬된 답변 — 직군별 첫 번째만 채택
    prisma.feedback.findMany.mockResolvedValue([
      {
        submissionId: 1,
        content: 'plan-answer-1',
        question: { category: RecordCategory.PLAN },
      },
      {
        submissionId: 1,
        content: 'plan-answer-2',
        question: { category: RecordCategory.PLAN },
      },
      {
        submissionId: 1,
        content: 'design-answer',
        question: { category: RecordCategory.DESIGN },
      },
    ])

    const result = await service.getRecentFeedbacks(6)

    expect(result.data).toEqual([
      {
        submissionId: 1,
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
    expect(prisma.feedbackAdoption.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { id: 'desc' }, take: 6 }),
    )
  })

  it('해당 직군 답변이 없으면 본문은 빈 문자열, 같은 아이콘은 presign 1회', async () => {
    prisma.feedbackAdoption.findMany.mockResolvedValue([
      buildAdoption(1, RecordCategory.PLAN, 'same-key'),
      buildAdoption(2, RecordCategory.DESIGN, 'same-key'),
    ])

    const result = await service.getRecentFeedbacks(6)

    expect(result.data.map((item) => item.content)).toEqual(['', ''])
    expect(storage.getSignedDownloadUrl).toHaveBeenCalledTimes(1)
  })
})
