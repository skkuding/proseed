import { BetterAuthGuard } from 'src/auth/guards/better-auth.guard'
import type { UserService } from './user.service'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common'
import type { MypageUpdateDto } from './dto/mypageUpdate.dto'

@Controller('me')
export class MypageController {
  constructor(private readonly userService: UserService) {}

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
}
