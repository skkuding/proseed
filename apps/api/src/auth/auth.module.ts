import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { BetterAuthService } from './better-auth.service'
import { BetterAuthGuard } from './guards/better-auth.guard'

@Module({
  controllers: [],
  providers: [
    BetterAuthService,
    BetterAuthGuard,
    //전역 가드: 모든 라우트 인증 필수, 공개 라우트만 @Public()/@OptionalAuth()로 opt-out
    { provide: APP_GUARD, useClass: BetterAuthGuard },
  ],
  exports: [BetterAuthService, BetterAuthGuard],
})
export class AuthModule {}
