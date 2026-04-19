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

@Controller('project/:projectId/versions/:versionId/feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // POST project/:id/versions/:versionId/feedbacks
  @Post()
  @UseGuards(BetterAuthGuard)
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
}
