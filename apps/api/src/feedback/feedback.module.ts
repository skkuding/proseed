import { Module } from '@nestjs/common'
import { FeedbackService } from './feedback.service'
import { FeedbackController, MyFeedbackController } from './feedback.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [FeedbackController, MyFeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
