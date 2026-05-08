import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
