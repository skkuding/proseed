import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaService } from 'src/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { generateRandomNickname } from '../user/utils/generateRandomNickname'
import { ConfigService } from '@nestjs/config'
import { selectRandomProfileImage } from 'src/user/utils/selectRandomProfileImage'

@Injectable()
export class BetterAuthService {
  public readonly auth: BetterAuthInstance

  constructor(prismaService: PrismaService, configService: ConfigService) {
    this.auth = createAuth(prismaService, configService)
  }
}
//auth 생성
const createAuth = (
  prismaService: PrismaService,
  configService: ConfigService,
) => {
  return betterAuth({
    secret: configService.getOrThrow('BETTER_AUTH_SECRET'),
    baseURL: configService.getOrThrow('BETTER_AUTH_URL'),
    database: prismaAdapter(prismaService, { provider: 'postgresql' }), //better-auth가 Prisma를 통해 DB에 접근
    advanced: {
      database: {
        generateId: 'serial',
      }, //DB에 저장할때 Int로 저장하고 실제 사용되는 값은 항상 string
    },
    user: {
      fields: {
        image: 'profileImageUrl', //better-auth 기본적으로 image 라는 필드명 사용 -> 우리 스키마랑 매핑해주기
      },
      deleteUser: {
        enabled: true,
      },
    },
    databaseHooks: {
      //user:create:before: User를 DB에 저장하기 전 실행되는 hook
      user: {
        create: {
          before: (user) => {
            //신규 유저라면 DB에 User 정보 저장하기 전, 랜덤 닉네임 자동 부여 (name이 NOT NULL이라 일단 넣기)
            const randomNickname = generateRandomNickname()
            const randomProfileImage = selectRandomProfileImage()
            return Promise.resolve({
              data: {
                ...user,
                name: randomNickname,
                image: randomProfileImage,
              },
            })
          },
        },
      },
    },
    socialProviders: {
      google: {
        clientId: configService.getOrThrow('GOOGLE_CLIENT_ID'),
        clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
        scope: ['email'],
      },
      kakao: {
        clientId: configService.getOrThrow('KAKAO_CLIENT_ID'),
        clientSecret: configService.getOrThrow('KAKAO_CLIENT_SECRET'),
        scope: ['email'],
      },
      naver: {
        clientId: configService.getOrThrow('NAVER_CLIENT_ID'),
        clientSecret: configService.getOrThrow('NAVER_CLIENT_SECRET'),
        scope: ['email'],
      },
    },
  })
}
// auth 반환 타입 정확하게 추론
type BetterAuthInstance = ReturnType<typeof createAuth>
