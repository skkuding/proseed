import { JobType } from '@prisma/client'
import { EntityNotExistException } from 'src/common/exceptions/business.exception'
import type { PrismaService } from '../prisma/prisma.service'
import { UserService } from './user.service'

type MockFn = jest.Mock

describe('UserService', () => {
  let service: UserService
  let prisma: {
    user: { findUnique: MockFn; update: MockFn }
  }

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn() },
    }
    service = new UserService(prisma as unknown as PrismaService)
  })

  describe('getUserProfile', () => {
    it('공개 프로필 필드만 조회해 반환한다', async () => {
      const profile = {
        id: 2,
        name: '성실한 개발자',
        profileImageUrl: 'https://example.com/profile.png',
        jobType: JobType.Developer,
        skills: ['TypeScript', 'NestJS'],
        links: ['https://github.com/someone'],
        bio: '안녕하세요',
      }
      prisma.user.findUnique.mockResolvedValue(profile)

      await expect(service.getUserProfile(2)).resolves.toEqual(profile)

      const [[query]] = prisma.user.findUnique.mock.calls as [
        [{ where: { id: number }; select: Record<string, boolean> }],
      ]
      expect(query.where).toEqual({ id: 2 })
      // 민감 정보(email, ownedTicketCount 등)는 select에 포함되지 않는다
      expect(Object.keys(query.select)).toEqual([
        'id',
        'name',
        'profileImageUrl',
        'jobType',
        'skills',
        'links',
        'bio',
      ])
    })

    it('존재하지 않는 유저면 EntityNotExistException을 던진다', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(service.getUserProfile(999)).rejects.toThrow(
        EntityNotExistException,
      )
    })
  })
})
