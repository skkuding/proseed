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
    private readonly jwtAuthService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async issueJwtTokens(userId: number) {
    const payload = { userId }

    const accessToken = await this.jwtAuthService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRE_TIME,
    })

    const refreshToken = await this.jwtAuthService.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRE_TIME,
    })
  }

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
    const oauth = await this.prisma.userOAuth.findUnique({
      where: {
        id_provider: { id: providerId, provider },
      },
    })
    if (oauth) {
      const user = this.prisma.user.findUnique({
        where: { id: oauth.userId },
      })
      if (!user) {
        throw new UnauthorizedException('User not found')
      }
      return user
    }

    const randomNickname = await this.generateRandonNickname()

    return await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: socialSignUpDto.email,
          name: randomNickname,
        },
      })
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
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth'
  }

  findAll() {
    return `This action returns all auth`
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`
  }

  remove(id: number) {
    return `This action removes a #${id} auth`
  }
}
