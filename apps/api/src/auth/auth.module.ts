import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
  imports: [JwtModule.register({}), CacheModule.register()],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
