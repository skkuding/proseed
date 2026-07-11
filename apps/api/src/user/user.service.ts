import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

import { Prisma, User } from '@prisma/client'
import { OnboardingDto } from './dto/onboarding.dto'
import type { MypageUpdateDto } from './dto/mypageUpdate.dto'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 신규 회원일 경우 온보딩 정보를 입력합니다.
   * @param {number} userId
   * @param {OnboardingDto} onboardingDto
   * @returns
   */
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

  /**
   * 유저의 신규/기존 회원 여부를 판별합니다.
   * @param {number} userId 유저 아이디
   * @returns 신규 유저 여부 & 유저 생성 시 초기 랜덤생성된 닉네임
   */
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

  /**
   * 유저의 프로필 정보들을 조회합니다.
   *
   * @param userId 유저 아이디
   * @returns 마이페이지 화면 표시 정보가 담긴 user 객체
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        accounts: {
          select: {
            providerId: true,
          },
        },
        jobType: true,
        profileImageUrl: true,
        skills: true,
        links: true,
        bio: true,
        ownedTicketCount: true,
      },
    })

    if (!user) throw new NotFoundException('User not found')

    return user
  }

  /**
   * 유저의 마이페이지 수정사항을 업데이트합니다.
   *
   * @param {number} userId 유저아이디
   * @param {MypageUpdateDto} mypageUpdateDto
   * @returns 정보가 업데이트된 유저 객체
   */
  async updateProfile(userId: number, mypageUpdateDto: MypageUpdateDto) {
    const { name, jobType, profileImageUrl, skills, links, bio } =
      mypageUpdateDto

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          name,
          jobType,
          profileImageUrl,
          skills,
          links,
          bio,
        },
        select: {
          name: true,
          jobType: true,
          profileImageUrl: true,
          skills: true,
          links: true,
          bio: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found')
        }
      }
      throw error
    }
  }
}
