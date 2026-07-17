import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/decorators/public.decorator'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { CreateVersionDto } from './dto/create-version.dto'
import { GetRecentGrowthRecordsDto } from './dto/get-recent-growth-records.dto'
import {
  FeedbackTemplateDto,
  PublishVersionResponseDto,
  RecentGrowthRecordDto,
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

  // GET growth-records/recent — mainpage 최근 성장기록 (공개)
  @Public()
  @Get('recent')
  async getRecentGrowthRecords(
    @Query() dto: GetRecentGrowthRecordsDto,
  ): Promise<RecentGrowthRecordDto[]> {
    return this.growthRecordService.getRecentGrowthRecords(dto.take ?? 5)
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
