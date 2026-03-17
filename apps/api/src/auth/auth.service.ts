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

  //refresh 요청이 오면 토큰을 다시 생성
  async updateJwtTokens(refreshToken: string) {
    const { userId, username, userRole } =
      await this.verifyJwtToken(refreshToken) //username, userRole도 payload에 포함해야 되나?
    if (!(await this.isValidRefreshToken(refreshToken, userId))) {
      throw new InvalidJwtTokenException('Unidentified refresh token')
    }
    return await this.createJwtTokens(userId)
  }

  //프론트에서 받은 refreshToken을 디코딩해서 userId 꺼냄
  async verifyJwtToken(token: string, options: JwtVerifyOptions = {}) {
    const jwtVerifyOptions = {
      secret: this.config.get('JWT_SECRET'),
      ...options,
    }
    try {
      return await this.jwtService.verifyAsync(token, jwtVerifyOptions)
    } catch (error) {
      throw new InvalidJwtTokenException(error.message)
    }
  }

  //refresh 요청시 key 값(userId &refreshToken)을 넣었을때 1이 나오면 유효한 refreshToken!
  async isValidRefreshToken(refreshToken: string, userId: number) {
    const cachedRefreshToken = await this.cacheManager.get(
      refreshTokenCacheKey(userId, refreshToken),
    )
    if (cachedRefreshToken !== 1) {
      return false
    }
    return true
  }

  async createJwtTokens(userId: number) {
    const payload: JwtPayload = { userId }
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRE_TIME,
    })
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRE_TIME,
    })

    // userId &refreshToken을 key로 cache에 저장
    await this.cacheManager.set(
      refreshTokenCacheKey(userId, refreshToken),
      1,
      REFRESH_TOKEN_EXPIRE_TIME * 1000, // milliseconds
    )

    return { accessToken, refreshToken } //토큰에 payload로 userId 담겨있음
  }

  //캐시에서 refreshToken을 삭제 (로그아웃)
  async deleteRefreshToken(userId: number, refreshToken: string) {
    return await this.cacheManager.del(
      refreshTokenCacheKey(userId, refreshToken),
    )
  }

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
