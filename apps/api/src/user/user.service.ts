import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { EntityNotExistException } from 'src/common/exceptions/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'

import { Prisma, User } from '@prisma/client'
import { OnboardingDto } from './dto/onboarding.dto'
import { UserProfileResponseDto } from './dto/user-response.dto'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(private readonly prisma: PrismaService) {}

  //신규 회원일 경우 온보딩 정보 입력
  async onboarding(
    userId: number,
    onboardingDto: OnboardingDto,
  ): Promise<User> {
    const { jobType, nickname } = onboardingDto
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          jobType,
          name: nickname,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == 'P2025') throw new NotFoundException()
      }
      throw error
    }
  }

  //다른 유저의 공개 프로필 조회 (프로젝트 상세 - 함께한 팀원용, 민감 정보 제외)
  async getUserProfile(userId: number): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profileImageUrl: true,
        jobType: true,
        skills: true,
        links: true,
        bio: true,
      },
    })
    if (!user) throw new EntityNotExistException('User')

    return user
  }

  async checkIsNewUser(
    userId: number,
  ): Promise<{ isNewUser: boolean; nickname: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        jobType: true,
        name: true,
      },
    })
    if (!user) throw new NotFoundException()
    const isNewUser = user.jobType === null

    return {
      isNewUser,
      nickname: user.name,
    }
  }
}
