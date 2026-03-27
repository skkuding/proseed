import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { BetterAuthService } from './better-auth.service'
import { BetterAuthGuard } from './guards/better-auth.guard'

@Module({
  controllers: [AuthController],
  providers: [BetterAuthService, BetterAuthGuard],
})
export class AuthModule {}
