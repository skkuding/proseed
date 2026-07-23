import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common'
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/decorators/public.decorator'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { GetRecentFeedbacksDto } from './dto/get-recent-feedbacks.dto'
import {
  CreateFeedbackResponseDto,
  FeedbackSubmissionDetailResponseDto,
  FeedbackQuestionsResponseDto,
  FeedbackListResponseDto,
  MyFeedbackProjectsResponseDto,
  RecentFeedbacksResponseDto,
} from './dto/feedback-response.dto'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'

//전역 가드로 전 라우트 인증 필수
@ApiTags('Feedback')
@ApiCookieAuth()
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
  ): Promise<CreateFeedbackResponseDto> {
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
  ): Promise<FeedbackQuestionsResponseDto> {
    return await this.feedbackService.findAllQuestions(projectId, versionId)
  }

  // GET project/:projectId/versions/:versionId/feedbacks
  @Get('feedbacks')
  async findFeedbacksForVersion(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
  ): Promise<FeedbackListResponseDto> {
    return await this.feedbackService.findFeedbacksForVersion(
      projectId,
      versionId,
    )
  }
}

//공개 라우트(recent)가 섞여 있어 인증 표기는 라우트 레벨로
@ApiTags('Feedback')
@Controller('feedbacks')
export class MyFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // GET feedbacks/recent — mainpage 최근 피드백 (채택된 제출만, 공개)
  // 반드시 :submissionId 보다 먼저 선언 — 아니면 recent가 submissionId로 매칭됨
  @Public()
  @Get('recent')
  async getRecentFeedbacks(
    @Query() dto: GetRecentFeedbacksDto,
  ): Promise<RecentFeedbacksResponseDto> {
    return await this.feedbackService.getRecentFeedbacks(dto.take ?? 6)
  }

  // GET feedbacks/my/projects
  @ApiCookieAuth()
  @Get('my/projects')
  async findMyFeedbackProjects(
    @Req() req: RequestWithUser,
  ): Promise<MyFeedbackProjectsResponseDto> {
    return await this.feedbackService.findMyFeedbackProjects(req.user.id)
  }

  // GET feedbacks/:submissionId
  @ApiCookieAuth()
  @Get(':submissionId')
  async findFeedbackSubmissionDetail(
    @Req() req: RequestWithUser,
    @Param('submissionId', ParseIntPipe) submissionId: number,
  ): Promise<FeedbackSubmissionDetailResponseDto> {
    return await this.feedbackService.findFeedbackSubmissionDetail(
      req.user.id,
      submissionId,
    )
  }
}
