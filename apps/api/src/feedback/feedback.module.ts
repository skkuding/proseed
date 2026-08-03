import { Module } from '@nestjs/common'
import { FeedbackService } from './feedback.service'
import {
  FeedbackController,
  MyFeedbackController,
  ProjectFeedbackController,
} from './feedback.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [
    FeedbackController,
    MyFeedbackController,
    ProjectFeedbackController,
  ],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
