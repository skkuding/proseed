import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { UpdateFeedbackDto } from './dto/update-feedback.dto'

@Controller('project/:projectId/versions/:versionId/feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // POST project/:id/versions/:versionId/feedbacks
  @Post()
  async create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    const userId = 1 // TODO: 임시 작성자 ID입니다. 나중에 인증이 붙으면 req.user.id 로 교체해야 합니다!
    return await this.feedbackService.create(
      userId,
      projectId,
      versionId,
      createFeedbackDto,
    )
  }
}
