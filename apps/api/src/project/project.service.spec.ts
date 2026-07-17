import { ProjectMemberRole } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
} from 'src/common/exceptions/business.exception'
import type { PrismaService } from '../prisma/prisma.service'
import type { StorageService } from '../storage/storage.service'
import { ProjectService } from './project.service'

type MockFn = jest.Mock

const LEAD_ID = 1
const PROJECT_ID = 10

describe('update — 프로젝트 편집 저장 (Lead만)', () => {
  let service: ProjectService
  let tx: {
    projectImage: { deleteMany: MockFn }
    project: { update: MockFn }
  }
  let prisma: {
    project: { findUnique: MockFn }
    projectRole: { findFirst: MockFn }
    $transaction: MockFn
  }

  beforeEach(() => {
    tx = {
      projectImage: { deleteMany: jest.fn().mockResolvedValue({}) },
      project: { update: jest.fn().mockResolvedValue({ id: PROJECT_ID }) },
    }
    prisma = {
      project: { findUnique: jest.fn().mockResolvedValue({ id: PROJECT_ID }) },
      projectRole: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ projectMemberRole: ProjectMemberRole.Lead }),
      },
      $transaction: jest.fn((cb: (t: typeof tx) => Promise<unknown>) => cb(tx)),
    }
    service = new ProjectService(
      prisma as unknown as PrismaService,
      {} as unknown as StorageService,
    )
  })

  it('존재하지 않는 프로젝트는 404', async () => {
    prisma.project.findUnique.mockResolvedValue(null)

    await expect(
      service.update(LEAD_ID, PROJECT_ID, { title: 'new' }),
    ).rejects.toThrow(EntityNotExistException)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('Lead가 아니면 403', async () => {
    prisma.projectRole.findFirst.mockResolvedValue(null)

    await expect(
      service.update(2, PROJECT_ID, { title: 'new' }),
    ).rejects.toThrow(ForbiddenAccessException)
    expect(prisma.projectRole.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 2,
        projectId: PROJECT_ID,
        projectMemberRole: ProjectMemberRole.Lead,
      },
    })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('scalar 필드만 오면 이미지는 건드리지 않고 key 필드를 컬럼으로 매핑한다', async () => {
    await service.update(LEAD_ID, PROJECT_ID, {
      title: 'new-title',
      iconKey: 'new-icon-key',
      thumbnailKey: 'new-thumb-key',
    })

    expect(tx.projectImage.deleteMany).not.toHaveBeenCalled()
    expect(tx.project.update).toHaveBeenCalledWith({
      where: { id: PROJECT_ID },
      data: {
        title: 'new-title',
        iconUrl: 'new-icon-key',
        thumbnailUrl: 'new-thumb-key',
      },
    })
  })

  it('imageKeys가 오면 기존 이미지를 지우고 순서대로 재생성한다', async () => {
    await service.update(LEAD_ID, PROJECT_ID, {
      imageKeys: ['key-a', 'key-b'],
    })

    expect(tx.projectImage.deleteMany).toHaveBeenCalledWith({
      where: { projectId: PROJECT_ID },
    })
    expect(tx.project.update).toHaveBeenCalledWith({
      where: { id: PROJECT_ID },
      data: {
        images: {
          create: [
            { url: 'key-a', order: 0 },
            { url: 'key-b', order: 1 },
          ],
        },
      },
    })
  })
})
