import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'

//전역 가드로 전 라우트 인증 필수
@Controller('project/:projectId/versions/:versionId')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // POST project/:id/versions/:versionId/feedbacks
  @Post('feedbacks')
  async createFeedback(
    @Req() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    const userId = req.user.id
    return await this.feedbackService.createFeedback(
      userId,
      projectId,
      versionId,
      createFeedbackDto,
    )
  }

  // GET project/:projectId/versions/:versionId/feedbackQuestions
  @Get('feedbackQuestions')
  async findAllQuestions(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
  ) {
    return await this.feedbackService.findAllQuestions(projectId, versionId)
  }
}
