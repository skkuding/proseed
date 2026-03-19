import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { SocialSignUpDto } from './dto/social-signup.dto'
import { SocialSignUpResponseDto } from './dto/social-signup-response.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService, type JwtVerifyOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from 'cache-manager'
import { getRandomNickname } from '@woowa-babble/random-nickname'
import {
  ACCESS_TOKEN_EXPIRE_TIME,
  REFRESH_TOKEN_EXPIRE_TIME,
} from 'src/common/constants/auth.constant'
import { InvalidJwtTokenException } from 'src/common/exceptions/business.exception'
import { refreshTokenCacheKey } from 'src/common/cache/auth.cache-key'
import { JwtPayload } from './interfaces/jwt.interface'
import { OnboardingDto } from './dto/onboarding.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async socialLogin(
    socialSignUpDto: SocialSignUpDto,
  ): Promise<SocialSignUpResponseDto> {
    const { provider, providerId, email } = socialSignUpDto
    //기존 로그인한 유저인지 userOAuth 테이블에서 확인
    const oauth = await this.prisma.userOAuth.findUnique({
      where: {
        id_provider: { id: providerId, provider },
      },
      include: { user: true },
    })
    //1. 기존 user라면 jwt 토큰 발행해서 userId를 payload로 담아 프론트에 응답 전달
    if (oauth) {
      if (!oauth.user) throw new UnauthorizedException('User not found')
      return {
        isNewUser: false,
        ...(await this.createJwtTokens(oauth.user.id)),
      }
    }

    //2. 신규 user라면 회원가입(새로운 user, userOAuth 생성) 후 jwt 토큰 발행해 userId를 payload로 담아 프론트에 응답 전달
    const randomNickname = await this.generateRandonNickname()

    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, name: randomNickname },
      })
      await tx.userOAuth.create({
        data: {
          id: providerId,
          provider,
          userId: user.id,
        },
      })
      return user
    })
    return {
      isNewUser: true,
      ...(await this.createJwtTokens(newUser.id)),
    }
  }

  //신규 회원일 경우 온보딩 정보 입력
  async onboarding(userId: number, onboardingDto: OnboardingDto) {
    const { jobType, nickname } = onboardingDto
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        jobType,
        name: nickname,
      },
    })
  }

  private async generateRandonNickname(): Promise<string> {
    const types = ['animals', 'heros', 'characters', 'monsters'] as const

    let username = ''
    let isInvalid = true

    while (isInvalid) {
      const randomType = types[Math.floor(Math.random() * types.length)]
      username = getRandomNickname(randomType)

      if (username.length > 12) {
        continue
      }

      isInvalid = false
    }
    return username
  }
}
