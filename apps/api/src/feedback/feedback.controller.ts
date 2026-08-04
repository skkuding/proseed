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
import { OptionalAuth, Public } from 'src/auth/decorators/public.decorator'
import { FeedbackService } from './feedback.service'
import {
  CreateFeedbackDto,
  CreateFreeformFeedbackDto,
} from './dto/create-feedback.dto'
import { GetRecentFeedbacksDto } from './dto/get-recent-feedbacks.dto'
import { UnlockFeedbackDto } from './dto/unlock-feedback.dto'
import {
  CreateFeedbackResponseDto,
  FeedbackSubmissionDetailResponseDto,
  FeedbackQuestionsResponseDto,
  FeedbackListResponseDto,
  MyFeedbackProjectsResponseDto,
  RecentFeedbacksResponseDto,
  UnlockFeedbackResponseDto,
} from './dto/feedback-response.dto'
import type {
  OptionalUserRequest,
  RequestWithUser,
} from 'src/common/types/request-with-user.type'

//성장기록(버전)이 아직 없는 프로젝트용 자유 피드백 — 버전에 매이지 않으므로 별도 컨트롤러
@ApiTags('Feedback')
@Controller('project/:projectId')
export class ProjectFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // POST project/:projectId/feedbacks
  @ApiCookieAuth()
  @Post('feedbacks')
  async createFreeformFeedback(
    @Req() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateFreeformFeedbackDto,
  ): Promise<CreateFeedbackResponseDto> {
    return await this.feedbackService.createFreeformFeedback(
      req.user.id,
      projectId,
      dto,
    )
  }

  // GET project/:projectId/feedbacks — 성장기록(버전) 없는 프로젝트의 자유 피드백 목록, 공개
  @OptionalAuth()
  @Get('feedbacks')
  async findFreeformFeedbacks(
    @Req() req: OptionalUserRequest,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<FeedbackListResponseDto> {
    return await this.feedbackService.findFeedbacksForVersion(
      projectId,
      null,
      req.user?.id,
    )
  }

  // POST project/:projectId/feedbacks/:submissionId/unlock — 자유 피드백 열람 (티켓 1개 차감, 무료 아님)
  @ApiCookieAuth()
  @Post('feedbacks/:submissionId/unlock')
  async unlockFreeformFeedback(
    @Req() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() dto: UnlockFeedbackDto,
  ): Promise<UnlockFeedbackResponseDto> {
    return await this.feedbackService.unlockFeedback(
      req.user.id,
      projectId,
      null,
      submissionId,
      dto.category,
    )
  }
}

//공개 목록(feedbacks)이 섞여 있어 인증 표기는 라우트 레벨로
@ApiTags('Feedback')
@Controller('project/:projectId/versions/:versionId')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // POST project/:id/versions/:versionId/feedbacks
  @ApiCookieAuth()
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
  @ApiCookieAuth()
  @Get('feedbackQuestions')
  async findAllQuestions(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
  ): Promise<FeedbackQuestionsResponseDto> {
    return await this.feedbackService.findAllQuestions(projectId, versionId)
  }

  // GET project/:projectId/versions/:versionId/feedbacks — 공개, 잠긴 답변은 본문 redact.
  // 비로그인은 항상 잠김(preview만); 로그인 상태면 본인이 쓴 답변만 unlock 여부와 무관하게 노출.
  @OptionalAuth()
  @Get('feedbacks')
  async findFeedbacksForVersion(
    @Req() req: OptionalUserRequest,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
  ): Promise<FeedbackListResponseDto> {
    return await this.feedbackService.findFeedbacksForVersion(
      projectId,
      versionId,
      req.user?.id,
    )
  }

  // POST .../feedbacks/:submissionId/unlock — 프로젝트 멤버만, 티켓 1개 차감 (제출×직군 단위)
  @ApiCookieAuth()
  @Post('feedbacks/:submissionId/unlock')
  async unlockFeedback(
    @Req() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() dto: UnlockFeedbackDto,
  ): Promise<UnlockFeedbackResponseDto> {
    return await this.feedbackService.unlockFeedback(
      req.user.id,
      projectId,
      versionId,
      submissionId,
      dto.category,
    )
  }
}

//공개 라우트(recent)가 섞여 있어 인증 표기는 라우트 레벨로
@ApiTags('Feedback')
@Controller('feedbacks')
export class MyFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // GET feedbacks/recent — mainpage 최근 피드백 (채택/unlock 여부 무관 전체, 공개)
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
