import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateAuthDto } from './dto/create-auth.dto'
import { UpdateAuthDto } from './dto/update-auth.dto'
import { SocialSignUpDto } from './dto/social-signup.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService, type JwtVerifyOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async updateJwtTokens(refreshToken: string) {
    const { userId, username, userRole } =
      await this.verifyJwtToken(refreshToken)
    if (!(await this.isValidRefreshToken(refreshToken, userId))) {
      throw new InvalidJwtTokenException('Unidentified refresh token')
    }
    return await this.createJwtTokens(userId)
  }

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

    // userId: refreshToken을 key로 cache에 저장
    await this.cacheManager.set(
      refreshTokenCacheKey(userId, refreshToken),
      1,
      REFRESH_TOKEN_EXPIRE_TIME * 1000, // milliseconds
    )

    return { accessToken, refreshToken }
  }

  async deleteRefreshToken(userId: number, refreshToken: string) {
    return await this.cacheManager.del(
      refreshTokenCacheKey(userId, refreshToken),
    )
  }

  async socialLogin(socialSignUpDto: SocialSignUpDto) {
    const { provider, providerId, email } = socialSignUpDto
    //기존 로그인한 유저인지 확인
    const oauth = await this.prisma.userOAuth.findUnique({
      where: {
        id_provider: { id: providerId, provider },
      },
      include: { user: true },
    })
    //1. 기존 user라면 jwt 토큰 발행
    if (oauth) {
      if (!oauth.user) throw new UnauthorizedException('User not found')
      return this.createJwtTokens(oauth.user.id)
    }

    //2. 신규 user라면 회원가입(새로운 user, userOAuth 생성) 후 jwt 토큰 발행
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
    return this.createJwtTokens(newUser.id)
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
