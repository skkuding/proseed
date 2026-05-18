import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaService } from 'src/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { generateRandomNickname } from '../user/utils/generateRandomNickname'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class BetterAuthService {
  public readonly auth: BetterAuthInstance

  constructor(prisma: PrismaService, config: ConfigService) {
    this.auth = createAuth(prisma, config)
  }
}
//auth 생성
const createAuth = (prisma: PrismaService, config: ConfigService) => {
  return betterAuth({
    secret: config.getOrThrow<string>('BETTER_AUTH_SECRET'),
    baseURL: config.getOrThrow<string>('BETTER_AUTH_URL'),
    database: prismaAdapter(prisma, { provider: 'postgresql' }), //better-auth가 Prisma를 통해 DB에 접근
    advanced: {
      database: {
        generateId: 'serial',
      }, //DB에 저장할때 Int로 저장하고 실제 사용되는 값은 항상 string
    },
    user: {
      fields: {
        image: 'profileImageUrl', //better-auth 기본적으로 image 라는 필드명 사용 -> 우리 스키마랑 매핑해주기
      },
    },
    databaseHooks: {
      //user:create:before: User를 DB에 저장하기 전 실행되는 hook
      user: {
        create: {
          before: (user) => {
            //신규 유저라면 DB에 User 정보 저장하기 전, 랜덤 닉네임 자동 부여 (name이 NOT NULL이라 일단 넣기)
            const randomNickname = generateRandomNickname()
            return Promise.resolve({
              data: {
                ...user,
                name: randomNickname,
              },
            })
          },
        },
      },
    },
    socialProviders: {
      google: {
        clientId: config.getOrThrow('GOOGLE_CLIENT_ID'),
        clientSecret: config.getOrThrow('GOOGLE_CLIENT_SECRET'),
      },
      kakao: {
        clientId: config.getOrThrow('KAKAO_CLIENT_ID'),
        clientSecret: config.getOrThrow('KAKAO_CLIENT_SECRET'),
        disableDefaultScope: true,
        scope: ['profile_image'], //프로필 이미지만 가져오기
      },
      naver: {
        clientId: config.getOrThrow('NAVER_CLIENT_ID'),
        clientSecret: config.getOrThrow('NAVER_CLIENT_SECRET'),
      },
    },
  })
}
// auth 반환 타입 정확하게 추론
type BetterAuthInstance = ReturnType<typeof createAuth>
