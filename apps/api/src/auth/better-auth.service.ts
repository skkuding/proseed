import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaService } from 'src/prisma/prisma.service'
import { getRandomNickname } from '@woowa-babble/random-nickname'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BetterAuthService {
  public readonly auth: ReturnType<typeof betterAuth>

  constructor(private readonly prisma: PrismaService) {
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
              const randomNickname = this.generateRandomNickname()
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
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        kakao: {
          clientId: process.env.KAKAO_CLIENT_ID!,
          clientSecret: process.env.KAKAO_CLIENT_SECRET!,
        },
        naver: {
          clientId: process.env.NAVER_CLIENT_ID!,
          clientSecret: process.env.NAVER_CLIENT_SECRET!,
        },
      },
    }) as unknown as ReturnType<typeof betterAuth>
  }

  private generateRandomNickname(): string {
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
