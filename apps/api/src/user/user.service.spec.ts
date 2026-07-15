import { JobType } from '@prisma/client'
import { EntityNotExistException } from 'src/common/exceptions/business.exception'
import type { PrismaService } from '../prisma/prisma.service'
import { UserService } from './user.service'

type MockFn = jest.Mock

describe('UserService', () => {
  let service: UserService
  let prisma: {
    user: { findUnique: MockFn; update: MockFn }
    projectRole: { count: MockFn }
    feedbackSubmission: { count: MockFn }
  }

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn() },
      projectRole: { count: jest.fn().mockResolvedValue(0) },
      feedbackSubmission: { count: jest.fn().mockResolvedValue(0) },
    }
    service = new UserService(prisma as unknown as PrismaService)
  })

  describe('getOtherUserProfile', () => {
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
      prisma.projectRole.count.mockResolvedValue(2)
      prisma.feedbackSubmission.count.mockResolvedValue(3)

      const result = await service.getOtherUserProfile(2)

      expect(result).toEqual({
        ...profile,
        joinedProjectCount: 2,
        feedbackCount: 3,
      })

      const [[query]] = prisma.user.findUnique.mock.calls as [
        [{ where: { id: number }; select: Record<string, boolean> }],
      ]
      expect(query.where).toEqual({ id: 2 })
      // 민감 정보(email, ownedTicketCount 등)는 select에 포함되지 않는다
      expect(Object.keys(query.select)).toEqual([
        'id',
        'name',
        'jobType',
        'profileImageUrl',
        'skills',
        'links',
        'bio',
      ])
      expect(prisma.projectRole.count).toHaveBeenCalledWith({
        where: { userId: 2 },
      })
      expect(prisma.feedbackSubmission.count).toHaveBeenCalledWith({
        where: { userId: 2 },
      })
    })

    it('존재하지 않는 유저면 EntityNotExistException을 던진다', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      try {
        await service.getOtherUserProfile(999)
        throw new Error('Expected getOtherUserProfile to throw')
      } catch (error) {
        expect(error).toBeInstanceOf(EntityNotExistException)
      }
    })
  })
})
