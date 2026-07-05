import { JobType, ProjectMemberRole, RecordCategory } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
} from 'src/common/exceptions/business.exception'
import type { PrismaService } from '../prisma/prisma.service'
import { GrowthRecordDraftService } from './growth-record-draft.service'

const USER_ID = 1
const PROJECT_ID = 10

type MockFn = jest.Mock

describe('GrowthRecordDraftService', () => {
  let service: GrowthRecordDraftService
  let prisma: {
    projectRole: { findUnique: MockFn }
    growthRecordDraft: {
      findMany: MockFn
      findUnique: MockFn
      upsert: MockFn
      delete: MockFn
    }
  }

  const asLead = () =>
    prisma.projectRole.findUnique.mockResolvedValue({
      projectMemberRole: ProjectMemberRole.Lead,
      role: JobType.Developer,
    })
  const asMember = (role: JobType) =>
    prisma.projectRole.findUnique.mockResolvedValue({
      projectMemberRole: ProjectMemberRole.TeamMember,
      role,
    })
  const asOutsider = () => prisma.projectRole.findUnique.mockResolvedValue(null)

  beforeEach(() => {
    prisma = {
      projectRole: { findUnique: jest.fn() },
      growthRecordDraft: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
    }
    service = new GrowthRecordDraftService(prisma as unknown as PrismaService)
  })

  describe('접근 권한', () => {
    it('프로젝트 멤버가 아니면 draft에 접근할 수 없다', async () => {
      asOutsider()

      await expect(service.getDrafts(USER_ID, PROJECT_ID)).rejects.toThrow(
        ForbiddenAccessException,
      )
    })

    it('팀원은 자기 직군 draft를 작성/수정할 수 있다', async () => {
      asMember(JobType.Designer)

      await service.upsertDraft(USER_ID, PROJECT_ID, RecordCategory.DESIGN, {
        answers: {},
      })

      expect(prisma.growthRecordDraft.upsert).toHaveBeenCalled()
    })

    it('팀원이 다른 직군 draft에 접근하면 403', async () => {
      asMember(JobType.Designer)

      await expect(
        service.upsertDraft(USER_ID, PROJECT_ID, RecordCategory.PLAN, {}),
      ).rejects.toThrow(ForbiddenAccessException)
      expect(prisma.growthRecordDraft.upsert).not.toHaveBeenCalled()
    })

    it('리드는 모든 직군 draft에 접근할 수 있다', async () => {
      asLead()

      await service.upsertDraft(USER_ID, PROJECT_ID, RecordCategory.PLAN, {})
      await service.upsertDraft(USER_ID, PROJECT_ID, RecordCategory.GENERAL, {})

      expect(prisma.growthRecordDraft.upsert).toHaveBeenCalledTimes(2)
    })
  })

  describe('getDrafts', () => {
    it('팀원은 자기 직군 draft만 조회된다', async () => {
      asMember(JobType.Planner)

      await service.getDrafts(USER_ID, PROJECT_ID)

      expect(prisma.growthRecordDraft.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            projectId: PROJECT_ID,
            category: { in: [RecordCategory.PLAN] },
          },
        }),
      )
    })

    it('리드는 전 직군 draft가 조회된다', async () => {
      asLead()

      await service.getDrafts(USER_ID, PROJECT_ID)

      expect(prisma.growthRecordDraft.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: PROJECT_ID } }),
      )
    })
  })

  describe('upsertDraft', () => {
    it('content와 마지막 수정자를 기록한다', async () => {
      asMember(JobType.Other)
      const content = { answers: { 1: 'text' } }

      await service.upsertDraft(
        USER_ID,
        PROJECT_ID,
        RecordCategory.GENERAL,
        content,
      )

      expect(prisma.growthRecordDraft.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            projectId_category: {
              projectId: PROJECT_ID,
              category: RecordCategory.GENERAL,
            },
          },
          create: expect.objectContaining({
            content,
            updatedById: USER_ID,
          }) as unknown,
          update: expect.objectContaining({
            content,
            updatedById: USER_ID,
          }) as unknown,
        }),
      )
    })
  })

  describe('getDraft / deleteDraft', () => {
    it('없는 draft 조회는 404', async () => {
      asLead()

      await expect(
        service.getDraft(USER_ID, PROJECT_ID, RecordCategory.PLAN),
      ).rejects.toThrow(EntityNotExistException)
    })

    it('없는 draft 삭제는 404', async () => {
      asLead()

      await expect(
        service.deleteDraft(USER_ID, PROJECT_ID, RecordCategory.PLAN),
      ).rejects.toThrow(EntityNotExistException)
      expect(prisma.growthRecordDraft.delete).not.toHaveBeenCalled()
    })

    it('존재하는 draft는 삭제된다', async () => {
      asMember(JobType.Developer)
      prisma.growthRecordDraft.findUnique.mockResolvedValue({ id: 77 })

      await service.deleteDraft(USER_ID, PROJECT_ID, RecordCategory.DEVELOPMENT)

      expect(prisma.growthRecordDraft.delete).toHaveBeenCalledWith({
        where: { id: 77 },
      })
    })
  })
})
