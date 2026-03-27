import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaClient } from '@prisma/client'
import { generateRandomNickname } from './utils/nickname'

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }), //Prisma 어댑터 사용: prisma에서 알아서
  advanced: {
    database: { generateId: false }, //better-auth 대신 DB가 직접 id 생성 담당 (autoincrement 유지)
  },
  databaseHooks: {
    //user:create:before: User를 DB에 생성하기 전 실행되는 hook
    user: {
      create: {
        before: async (user) => {
          //신규 유저라면 DB에 User 생성하면서 랜덤 닉네임 자동 부여 (name이 NOT NULL이라 일단 넣기)
          const randomNickname = await generateRandomNickname()
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
})
