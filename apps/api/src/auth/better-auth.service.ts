import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaService } from 'src/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { generateRandomNickname } from '../user/utils/generateRandomNickname'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class BetterAuthService {
  public readonly auth: ReturnType<typeof betterAuth>

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.auth = betterAuth({
      database: () => prismaAdapter(this.prisma, { provider: 'postgresql' }), //Prisma 어댑터 사용: prisma에서 알아서
      advanced: {
        database: { generateId: false }, //better-auth 대신 DB가 직접 id 생성 담당 (autoincrement 유지)
      },
      databaseHooks: {
        //user:create:before: User를 DB에 생성하기 전 실행되는 hook
        user: {
          create: {
            before: async (user) => {
              //신규 유저라면 DB에 User 생성하면서 랜덤 닉네임 자동 부여 (name이 NOT NULL이라 일단 넣기)
              const randomNickname = generateRandomNickname()
              return {
                data: {
                  ...user,
                  name: randomNickname,
                },
              }
            },
          },
        },
      },
      socialProviders: {
        google: {
          clientId: this.config.getOrThrow('GOOGLE_CLIENT_ID'),
          clientSecret: this.config.getOrThrow('GOOGLE_CLIENT_SECRET'),
        },
        kakao: {
          clientId: this.config.getOrThrow('KAKAO_CLIENT_ID'),
          clientSecret: this.config.getOrThrow('KAKAO_CLIENT_SECRET'),
        },
        naver: {
          clientId: this.config.getOrThrow('NAVER_CLIENT_ID'),
          clientSecret: this.config.getOrThrow('NAVER_CLIENT_SECRET'),
        },
      },
    }) as unknown as ReturnType<typeof betterAuth>
  }
}
