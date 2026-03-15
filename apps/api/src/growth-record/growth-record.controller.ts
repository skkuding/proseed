import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common'
import type { AuthenticatedRequest } from 'libs/auth/src/authenticated-request.interface'
import { CreateVersionDto } from './dto/create-version.dto'
import { GrowthRecordService } from './growth-record.service'

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
}
