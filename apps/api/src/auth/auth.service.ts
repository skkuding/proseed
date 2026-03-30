import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { OnboardingDto } from './dto/onboarding.dto'
import { User } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  //신규 회원일 경우 온보딩 정보 입력
  async onboarding(
    userId: number,
    onboardingDto: OnboardingDto,
  ): Promise<User> {
    const { jobType, nickname } = onboardingDto
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        jobType,
        name: nickname,
      },
    })
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
    return {
      isNewUser: user.jobType === null,
      nickname: user.name,
    }
  }
}
