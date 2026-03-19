import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  advanced: {
    database: {
      generateId: false, // better-auth 대신 DB가 직접 id 생성 담당 (autoincrement 유지)
    },
  },
  socialProviders: {
    google: { clientId: '...', clientSecret: '...' },
    kakao: { clientId: '...', clientSecret: '...' },
    naver: { clientId: '...', clientSecret: '...' },
  },
})
