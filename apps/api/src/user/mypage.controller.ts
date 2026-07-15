import { BetterAuthGuard } from 'src/auth/guards/better-auth.guard'
import { UserService } from './user.service'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common'
import { MypageUpdateDto } from './dto/mypageUpdate.dto'
import { FeedbackService } from 'src/feedback/feedback.service'
import { ProjectService } from 'src/project/project.service'
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'

@ApiTags('Mypage')
@ApiCookieAuth()
@UseGuards(BetterAuthGuard)
@Controller('me')
export class MypageController {
  constructor(
    private readonly userService: UserService,
    private readonly feedbackService: FeedbackService,
    private readonly projectService: ProjectService,
  ) {}

  @Get('profile')
  async getMyProfile(@Req() req: RequestWithUser) {
    return await this.userService.getMyProfile(req.user.id)
  }

  @Patch('profile')
  async updateMyProfile(
    @Req() req: RequestWithUser,
    @Body() mypageUpdateDto: MypageUpdateDto,
  ) {
    return await this.userService.updateMyProfile(req.user.id, mypageUpdateDto)
  }

  @Get('profile/projects')
  async getMyJoinedProjects(@Req() req: RequestWithUser) {
    return this.projectService.getJoinedProjects(req.user.id)
  }

  @Get('profile/feedbacks')
  async getMyFeedbacks(@Req() req: RequestWithUser) {
    return this.feedbackService.findMyFeedbackProjects(req.user.id)
  }
}
