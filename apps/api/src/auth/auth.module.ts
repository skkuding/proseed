import { Module } from '@nestjs/common'
import { BetterAuthService } from './better-auth.service'
import { BetterAuthGuard } from './guards/better-auth.guard'

@Module({
  controllers: [],
  providers: [BetterAuthService, BetterAuthGuard],
  exports: [BetterAuthService, BetterAuthGuard],
})
export class AuthModule {}
