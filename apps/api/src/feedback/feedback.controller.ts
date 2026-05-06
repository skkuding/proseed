import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { UpdateFeedbackDto } from './dto/update-feedback.dto'
import { BetterAuthGuard } from 'src/auth/guards/better-auth.guard'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'

@Controller('project/:projectId/versions/:versionId/')
@UseGuards(BetterAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // POST project/:projectId/versions/:versionId/feedbacks
  @Post('feedbacks')
  async create(
    @Req() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    const userId = req.user.id
    return await this.feedbackService.create(
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
