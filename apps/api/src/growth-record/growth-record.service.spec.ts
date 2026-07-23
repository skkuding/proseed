import { JobType, ProjectMemberRole, RecordCategory } from '@prisma/client'
import {
  ConflictFoundException,
  DuplicateFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException,
} from 'src/common/exceptions/business.exception'
import type { PrismaService } from '../prisma/prisma.service'
import type { StorageService } from '../storage/storage.service'
import type { CreateVersionDto } from './dto/create-version.dto'
import { GrowthRecordService } from './growth-record.service'

const LEAD_ID = 1
const PROJECT_ID = 10
const PREV_VERSION_ID = 5
const ALL_CATEGORIES = Object.values(RecordCategory)

//tx.projectVersion.create mock이 반환하는 성장기록 id: PLAN=200, DESIGN=201, DEVELOPMENT=202, GENERAL=203
const RECORD_ID_BASE = 200
const recordIdOf = (category: RecordCategory) =>
  RECORD_ID_BASE + ALL_CATEGORIES.indexOf(category)

const buildDto = (
  overrides: Partial<CreateVersionDto> = {},
): CreateVersionDto => ({
  version: '1.0.0',
  updateGoal: 'goal',
  updateResults: ['result'],
  growthRecords: ALL_CATEGORIES.map((category) => ({
    category,
    contents: [{ title: 'title', content: 'content' }],
    imageKeys: [],
  })),
  feedbackQuestions: ALL_CATEGORIES.map((category) => ({
    category,
    content: 'question',
  })),
  ...overrides,
})

const buildSubmission = (
  id: number,
  userId: number,
  categories: RecordCategory[],
  options: {
    adopted?: boolean
    projectId?: number
    versionId?: number
    unlocked?: boolean
  } = {},
) => ({
  id,
  versionId: options.versionId ?? PREV_VERSION_ID,
  projectId: options.projectId ?? PROJECT_ID,
  userId,
  adoptions: options.adopted ? [{ id: 999 }] : [],
  //채택은 unlock 선행 필수 — 기본은 열린 상태로 두고, 미열람 케이스만 unlocked:false로 지정
  unlocks: options.unlocked === false ? [] : [{ id: 888 }],
  feedbacks: categories.map((category) => ({ question: { category } })),
})

type MockFn = jest.Mock

interface MockTx {
  projectVersion: { findMany: MockFn; create: MockFn }
  projectRole: { findMany: MockFn }
  feedbackSubmission: { findMany: MockFn }
  feedbackAdoption: { createMany: MockFn }
  growthRecordDraft: { deleteMany: MockFn }
  user: { update: MockFn; updateMany: MockFn }
}

describe('GrowthRecordService', () => {
  let service: GrowthRecordService
  let tx: MockTx
  let prisma: {
    projectRole: { findUnique: MockFn }
    projectVersion: { findUnique: MockFn }
    $transaction: MockFn
  }
  let storage: { getSignedDownloadUrl: MockFn }

  beforeEach(() => {
    tx = {
      projectVersion: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({
          id: 100,
          growthRecords: ALL_CATEGORIES.map((category) => ({
            id: recordIdOf(category),
            category,
            contents: [],
            images: [],
          })),
          feedbackQuestions: [],
        }),
      },
      projectRole: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ userId: 1 }, { userId: 2 }, { userId: 3 }]),
      },
      feedbackSubmission: { findMany: jest.fn().mockResolvedValue([]) },
      feedbackAdoption: { createMany: jest.fn().mockResolvedValue({}) },
      growthRecordDraft: { deleteMany: jest.fn().mockResolvedValue({}) },
      user: {
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({}),
      },
    }
    prisma = {
      projectRole: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ projectMemberRole: ProjectMemberRole.Lead }),
      },
      projectVersion: { findUnique: jest.fn() },
      $transaction: jest.fn((cb: (tx: MockTx) => Promise<unknown>) => cb(tx)),
    }
    storage = {
      getSignedDownloadUrl: jest.fn().mockResolvedValue('signed-url'),
    }
    service = new GrowthRecordService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    )
  })

  describe('createVersion — 권한/중복 검증', () => {
    it('Lead가 아닌 팀원은 발행할 수 없다', async () => {
      prisma.projectRole.findUnique.mockResolvedValue({
        projectMemberRole: ProjectMemberRole.TeamMember,
      })

      await expect(
        service.createVersion(LEAD_ID, PROJECT_ID, buildDto()),
      ).rejects.toThrow(ForbiddenAccessException)
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('프로젝트 멤버가 아니면 발행할 수 없다', async () => {
      prisma.projectRole.findUnique.mockResolvedValue(null)

      await expect(
        service.createVersion(LEAD_ID, PROJECT_ID, buildDto()),
      ).rejects.toThrow(ForbiddenAccessException)
    })

    it('버전명이 중복되면 발행할 수 없다', async () => {
      tx.projectVersion.findMany.mockResolvedValue([{ version: '1.0.0' }])

      await expect(
        service.createVersion(LEAD_ID, PROJECT_ID, buildDto()),
      ).rejects.toThrow(DuplicateFoundException)
    })

    it('기존 버전보다 낮은 버전은 발행할 수 없다', async () => {
      tx.projectVersion.findMany.mockResolvedValue([{ version: '1.2.0' }])

      await expect(
        service.createVersion(
          LEAD_ID,
          PROJECT_ID,
          buildDto({ version: '1.0.0' }),
        ),
      ).rejects.toThrow(UnprocessableDataException)
      expect(tx.projectVersion.create).not.toHaveBeenCalled()
    })

    it('기존 모든 버전보다 큰 버전은 발행할 수 있다', async () => {
      tx.projectVersion.findMany.mockResolvedValue([
        { version: '1.2.0' },
        { version: '0.9.9' },
      ])

      await service.createVersion(
        LEAD_ID,
        PROJECT_ID,
        buildDto({ version: '1.2.1' }),
      )

      expect(tx.projectVersion.create).toHaveBeenCalled()
    })

    it('형식이 다른 레거시 버전은 순서 비교에서 건너뛴다', async () => {
      tx.projectVersion.findMany.mockResolvedValue([{ version: 'legacy-v1' }])

      await service.createVersion(
        LEAD_ID,
        PROJECT_ID,
        buildDto({ version: '0.0.1' }),
      )

      expect(tx.projectVersion.create).toHaveBeenCalled()
    })
  })

  describe('createVersion — 발행 보상', () => {
    it('releasedAt을 발행 시각으로 설정하고 팀원 전원에게 티켓 +1을 지급한다', async () => {
      await service.createVersion(LEAD_ID, PROJECT_ID, buildDto())

      const [[createArgs]] = tx.projectVersion.create.mock.calls as [
        [{ data: { releasedAt: unknown } }],
      ]
      expect(createArgs.data.releasedAt).toBeInstanceOf(Date)
      expect(tx.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
        data: { ownedTicketCount: { increment: 1 } },
      })
      expect(tx.feedbackAdoption.createMany).not.toHaveBeenCalled()
      expect(tx.user.update).not.toHaveBeenCalled()
    })

    it('발행에 성공하면 프로젝트의 draft를 자동 삭제한다', async () => {
      await service.createVersion(LEAD_ID, PROJECT_ID, buildDto())

      expect(tx.growthRecordDraft.deleteMany).toHaveBeenCalledWith({
        where: { projectId: PROJECT_ID },
      })
    })
  })

  describe('createVersion — 태그(=채택) 보상', () => {
    it('단일 직군에서 채택된 제출의 작성자는 +3을 받는다', async () => {
      tx.feedbackSubmission.findMany.mockResolvedValue([
        buildSubmission(50, 7, [RecordCategory.PLAN]),
      ])

      await service.createVersion(
        LEAD_ID,
        PROJECT_ID,
        buildDto({
          taggedFeedbacks: [
            {
              category: RecordCategory.PLAN,
              submissions: [{ versionId: PREV_VERSION_ID, userId: 7 }],
            },
          ],
        }),
      )

      expect(tx.feedbackAdoption.createMany).toHaveBeenCalledWith({
        data: [
          {
            growthRecordId: recordIdOf(RecordCategory.PLAN),
            submissionId: 50,
          },
        ],
      })
      expect(tx.user.update).toHaveBeenCalledTimes(1)
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { ownedTicketCount: { increment: 3 } },
      })
    })

    it('같은 제출이 2개 이상 직군에서 동시 채택되면 총 +5를 받는다', async () => {
      tx.feedbackSubmission.findMany.mockResolvedValue([
        buildSubmission(50, 7, [RecordCategory.PLAN, RecordCategory.DESIGN]),
      ])

      await service.createVersion(
        LEAD_ID,
        PROJECT_ID,
        buildDto({
          taggedFeedbacks: [
            {
              category: RecordCategory.PLAN,
              submissions: [{ versionId: PREV_VERSION_ID, userId: 7 }],
            },
            {
              category: RecordCategory.DESIGN,
              submissions: [{ versionId: PREV_VERSION_ID, userId: 7 }],
            },
          ],
        }),
      )

      expect(tx.feedbackAdoption.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          {
            growthRecordId: recordIdOf(RecordCategory.PLAN),
            submissionId: 50,
          },
          {
            growthRecordId: recordIdOf(RecordCategory.DESIGN),
            submissionId: 50,
          },
        ]) as unknown,
      })
      expect(tx.user.update).toHaveBeenCalledTimes(1)
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { ownedTicketCount: { increment: 5 } },
      })
    })

    it('한 작성자의 서로 다른 제출 2건이 각각 채택되면 합산 +6을 받는다 (상한 없음)', async () => {
      //같은 유저라도 버전이 다르면(@@unique([versionId, userId])) 서로 다른 제출이 된다
      tx.feedbackSubmission.findMany.mockResolvedValue([
        buildSubmission(50, 7, [RecordCategory.PLAN], { versionId: 5 }),
        buildSubmission(51, 7, [RecordCategory.DESIGN], { versionId: 6 }),
      ])

      await service.createVersion(
        LEAD_ID,
        PROJECT_ID,
        buildDto({
          taggedFeedbacks: [
            {
              category: RecordCategory.PLAN,
              submissions: [{ versionId: 5, userId: 7 }],
            },
            {
              category: RecordCategory.DESIGN,
              submissions: [{ versionId: 6, userId: 7 }],
            },
          ],
        }),
      )

      expect(tx.user.update).toHaveBeenCalledTimes(1)
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { ownedTicketCount: { increment: 6 } },
      })
    })

    it('이미 채택된 제출은 다시 태그할 수 없다', async () => {
      tx.feedbackSubmission.findMany.mockResolvedValue([
        buildSubmission(50, 7, [RecordCategory.PLAN], { adopted: true }),
      ])

      await expect(
        service.createVersion(
          LEAD_ID,
          PROJECT_ID,
          buildDto({
            taggedFeedbacks: [
              {
                category: RecordCategory.PLAN,
                submissions: [{ versionId: PREV_VERSION_ID, userId: 7 }],
              },
            ],
          }),
        ),
      ).rejects.toThrow(ConflictFoundException)
      expect(tx.projectVersion.create).not.toHaveBeenCalled()
    })

    it('열람(unlock)되지 않은 제출은 채택(태그)할 수 없다', async () => {
      tx.feedbackSubmission.findMany.mockResolvedValue([
        buildSubmission(50, 7, [RecordCategory.PLAN], { unlocked: false }),
      ])

      await expect(
        service.createVersion(
          LEAD_ID,
          PROJECT_ID,
          buildDto({
            taggedFeedbacks: [
              {
                category: RecordCategory.PLAN,
                submissions: [{ versionId: PREV_VERSION_ID, userId: 7 }],
              },
            ],
          }),
        ),
      ).rejects.toThrow(UnprocessableDataException)
      expect(tx.projectVersion.create).not.toHaveBeenCalled()
    })

    it('해당 직군 답변이 없는 제출은 그 직군에 태그할 수 없다', async () => {
      tx.feedbackSubmission.findMany.mockResolvedValue([
        buildSubmission(50, 7, [RecordCategory.DESIGN]),
      ])

      await expect(
        service.createVersion(
          LEAD_ID,
          PROJECT_ID,
          buildDto({
            taggedFeedbacks: [
              {
                category: RecordCategory.PLAN,
                submissions: [{ versionId: PREV_VERSION_ID, userId: 7 }],
              },
            ],
          }),
        ),
      ).rejects.toThrow(UnprocessableDataException)
    })

    it('존재하지 않는 제출은 태그할 수 없다', async () => {
      tx.feedbackSubmission.findMany.mockResolvedValue([])

      await expect(
        service.createVersion(
          LEAD_ID,
          PROJECT_ID,
          buildDto({
            taggedFeedbacks: [
              {
                category: RecordCategory.PLAN,
                submissions: [{ versionId: PREV_VERSION_ID, userId: 999 }],
              },
            ],
          }),
        ),
      ).rejects.toThrow(EntityNotExistException)
    })

    it('다른 프로젝트의 제출은 태그할 수 없다', async () => {
      tx.feedbackSubmission.findMany.mockResolvedValue([
        buildSubmission(50, 7, [RecordCategory.PLAN], { projectId: 999 }),
      ])

      await expect(
        service.createVersion(
          LEAD_ID,
          PROJECT_ID,
          buildDto({
            taggedFeedbacks: [
              {
                category: RecordCategory.PLAN,
                submissions: [{ versionId: PREV_VERSION_ID, userId: 7 }],
              },
            ],
          }),
        ),
      ).rejects.toThrow(EntityNotExistException)
    })

    it('직군당 3개 초과 태그는 항목을 쪼개 보내도 거부된다', async () => {
      await expect(
        service.createVersion(
          LEAD_ID,
          PROJECT_ID,
          buildDto({
            taggedFeedbacks: [
              {
                category: RecordCategory.PLAN,
                submissions: [
                  { versionId: PREV_VERSION_ID, userId: 1 },
                  { versionId: PREV_VERSION_ID, userId: 2 },
                  { versionId: PREV_VERSION_ID, userId: 3 },
                ],
              },
              {
                category: RecordCategory.PLAN,
                submissions: [{ versionId: PREV_VERSION_ID, userId: 4 }],
              },
            ],
          }),
        ),
      ).rejects.toThrow(UnprocessableDataException)
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })
  })

  describe('getVersionDetail', () => {
    it('없는 버전이면 EntityNotExistException을 던진다', async () => {
      prisma.projectVersion.findUnique.mockResolvedValue(null)

      await expect(service.getVersionDetail(1)).rejects.toThrow(
        EntityNotExistException,
      )
    })

    it('태그된 피드백을 작성자 정보와 함께 반환하고 이미지는 presigned URL로 변환한다', async () => {
      prisma.projectVersion.findUnique.mockResolvedValue({
        id: 1,
        growthRecords: [
          {
            id: recordIdOf(RecordCategory.PLAN),
            category: RecordCategory.PLAN,
            contents: [],
            images: [{ url: 'image-key', order: 0 }],
            adoptions: [
              {
                submission: {
                  id: 50,
                  oneLineReview: 'nice project',
                  user: {
                    name: '작성자',
                    profileImageUrl: '/profile.svg',
                    jobType: JobType.Developer,
                  },
                },
              },
            ],
          },
        ],
        feedbackQuestions: [],
      })

      const result = await service.getVersionDetail(1)

      expect(result.growthRecords[0].taggedFeedbacks).toEqual([
        {
          id: 50,
          author: {
            name: '작성자',
            profileImageUrl: '/profile.svg',
            role: JobType.Developer,
          },
          content: 'nice project',
        },
      ])
      expect(result.growthRecords[0].images[0].url).toBe('signed-url')
      expect(result.growthRecords[0]).not.toHaveProperty('adoptions')
    })
  })
})

describe('getRecentGrowthRecords — mainpage 최근 성장기록', () => {
  const buildVersion = (id: number, iconUrl = 'icon-key') => ({
    id,
    updateGoal: `goal-${id}`,
    releasedAt: new Date('2026-07-01T00:00:00Z'),
    createdAt: new Date('2026-06-30T00:00:00Z'),
    project: {
      id: id * 10,
      title: `project-${id}`,
      iconUrl,
      category: ['PRODUCTIVITY'],
    },
    growthRecords: ALL_CATEGORIES.map((category, index) => ({
      id: id * 100 + index,
      category,
      contents: [{ title: `title-${category}` }],
    })),
  })

  const setup = (versions: unknown[]) => {
    const prisma = {
      projectVersion: { findMany: jest.fn().mockResolvedValue(versions) },
    }
    const storage = {
      getSignedDownloadUrl: jest.fn().mockResolvedValue('signed-icon-url'),
    }
    const service = new GrowthRecordService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    )
    return { service, prisma, storage }
  }

  it('발행 버전 × 4개 직군을 flat하게 매핑한다 (아이콘은 presigned)', async () => {
    const { service, prisma } = setup([buildVersion(1)])

    const result = await service.getRecentGrowthRecords(5)

    expect(prisma.projectVersion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { releasedAt: { not: null } },
        orderBy: { releasedAt: 'desc' },
        take: 5,
      }),
    )
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({
      growthRecordId: 100,
      versionId: 1,
      projectId: 10,
      projectName: 'project-1',
      projectIconUrl: 'signed-icon-url',
      projectCategories: ['PRODUCTIVITY'],
      category: ALL_CATEGORIES[0],
      title: `title-${ALL_CATEGORIES[0]}`,
      updateGoal: 'goal-1',
      releasedAt: new Date('2026-07-01T00:00:00Z'),
    })
  })

  it('같은 프로젝트 아이콘은 presign을 1회만 호출한다', async () => {
    const { service, storage } = setup([
      buildVersion(1, 'same-key'),
      buildVersion(2, 'same-key'),
    ])

    const result = await service.getRecentGrowthRecords(5)

    expect(result).toHaveLength(8)
    expect(storage.getSignedDownloadUrl).toHaveBeenCalledTimes(1)
  })

  it('content가 없는 성장기록의 title은 빈 문자열이다', async () => {
    const version = buildVersion(1)
    version.growthRecords[0].contents = []
    const { service } = setup([version])

    const result = await service.getRecentGrowthRecords(5)

    expect(result[0].title).toBe('')
  })
})
