import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Put,
  Req,
} from '@nestjs/common'
import { RecordCategory } from '@prisma/client'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { UpsertDraftDto } from './dto/upsert-draft.dto'
import { GrowthRecordDraftService } from './growth-record-draft.service'

//전역 가드로 전 라우트 인증 필수 — 직군별 접근 권한은 서비스에서 검증
@Controller('project/:id/drafts')
export class GrowthRecordDraftController {
  constructor(private readonly draftService: GrowthRecordDraftService) {}

  //리드는 전 직군, 팀원은 자기 직군 draft만 반환
  @Get()
  async getDrafts(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return this.draftService.getDrafts(req.user.id, projectId)
  }

  @Get(':category')
  async getDraft(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) projectId: number,
    @Param('category', new ParseEnumPipe(RecordCategory))
    category: RecordCategory,
  ) {
    return this.draftService.getDraft(req.user.id, projectId, category)
  }

  //생성/수정 통합 (직군당 공유 draft 1개)
  @Put(':category')
  async upsertDraft(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) projectId: number,
    @Param('category', new ParseEnumPipe(RecordCategory))
    category: RecordCategory,
    @Body() dto: UpsertDraftDto,
  ) {
    return this.draftService.upsertDraft(
      req.user.id,
      projectId,
      category,
      dto.content,
    )
  }

  @Delete(':category')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDraft(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) projectId: number,
    @Param('category', new ParseEnumPipe(RecordCategory))
    category: RecordCategory,
  ) {
    await this.draftService.deleteDraft(req.user.id, projectId, category)
  }
}
