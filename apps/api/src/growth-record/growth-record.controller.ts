import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common'
import type { AuthenticatedRequest } from 'libs/auth/src/authenticated-request.interface'
import { AdoptFeedbackDto } from './dto/adopt-feedback.dto'
import { CreateVersionDto } from './dto/create-version.dto'
import { GrowthRecordService } from './growth-record.service'

@Controller('growth-records')
export class GrowthRecordTemplateController {
  constructor(private readonly growthRecordService: GrowthRecordService) {}

  @Get('feedback-templates')
  getFeedbackTemplates() {
    return this.growthRecordService.getFeedbackTemplates()
  }
}

@Controller('project/:id/versions')
export class GrowthRecordController {
  constructor(private readonly growthRecordService: GrowthRecordService) {}

  @Post()
  async createVersion(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: CreateVersionDto,
  ) {
    return this.growthRecordService.createVersion(req.user.id, projectId, dto)
  }

  @Get(':versionId')
  async getVersionDetail(@Param('versionId', ParseIntPipe) versionId: number) {
    return this.growthRecordService.getVersionDetail(versionId)
  }

  @Patch(':versionId/feedbacks/:feedbackId/adopt')
  async adoptFeedback(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
    @Body() dto: AdoptFeedbackDto,
  ) {
    return this.growthRecordService.adoptFeedback(
      req.user.id,
      projectId,
      versionId,
      feedbackId,
      dto.category,
    )
  }
}
