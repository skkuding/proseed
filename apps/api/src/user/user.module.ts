import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { MypageController } from './mypage.controller'
import { FeedbackModule } from 'src/feedback/feedback.module'

@Module({
  imports: [AuthModule, FeedbackModule],
  controllers: [UserController, MypageController],
  providers: [UserService],
})
export class UserModule {}
