import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common'
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/decorators/public.decorator'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { CreateVersionDto } from './dto/create-version.dto'
import {
  FeedbackTemplateDto,
  PublishVersionResponseDto,
  VersionDetailResponseDto,
} from './dto/version-response.dto'
import { GrowthRecordService } from './growth-record.service'

@ApiTags('GrowthRecord')
@Controller('growth-records')
export class GrowthRecordTemplateController {
  constructor(private readonly growthRecordService: GrowthRecordService) {}

  @Public()
  @Get('feedback-templates')
  getFeedbackTemplates(): FeedbackTemplateDto[] {
    return this.growthRecordService.getFeedbackTemplates()
  }
}

@ApiTags('GrowthRecord')
@Controller('project/:id/versions')
export class GrowthRecordController {
  constructor(private readonly growthRecordService: GrowthRecordService) {}

  //발행(성장기록 + 피드백 질문 + 피드백 태그) — Lead만 가능 (서비스에서 검증)
  @ApiCookieAuth()
  @Post()
  async createVersion(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: CreateVersionDto,
  ): Promise<PublishVersionResponseDto> {
    return this.growthRecordService.createVersion(req.user.id, projectId, dto)
  }

  @Public()
  @Get(':versionId')
  async getVersionDetail(
    @Param('versionId', ParseIntPipe) versionId: number,
  ): Promise<VersionDetailResponseDto> {
    return this.growthRecordService.getVersionDetail(versionId)
  }
}
