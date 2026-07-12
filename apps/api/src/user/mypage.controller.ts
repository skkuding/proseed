import { BetterAuthGuard } from 'src/auth/guards/better-auth.guard'
import { UserService } from './user.service'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common'
import { MypageUpdateDto } from './dto/mypageUpdate.dto'
import { FeedbackService } from 'src/feedback/feedback.service'

@Controller('me')
export class MypageController {
  constructor(
    private readonly userService: UserService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Get('profile')
  @UseGuards(BetterAuthGuard)
  async getProfile(@Req() req: RequestWithUser) {
    return await this.userService.getProfile(req.user.id)
  }

  @Patch('profile')
  @UseGuards(BetterAuthGuard)
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() mypageUpdateDto: MypageUpdateDto,
  ) {
    return await this.userService.updateProfile(req.user.id, mypageUpdateDto)
  }

  //Get('profile/projects)

  @Get('profile/feedbacks')
  @UseGuards(BetterAuthGuard)
  async getMyFeedbacks(@Req() req: RequestWithUser) {
    return this.feedbackService.findMyFeedbackProjects(req.user.id)
  }
}
