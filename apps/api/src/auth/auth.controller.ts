import { Controller, Body, Patch, UseGuards, Req, Get } from '@nestjs/common'
import { AuthService } from './auth.service'
import { OnboardingDto } from './dto/onboarding.dto'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { BetterAuthGuard } from './guards/better-auth.guard'
import { generateRandomNickname } from './utils/generateRandomNickname'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('check') //기존 or 신규 유저인지 확인 + 초기 생성 닉네임 반환
  @UseGuards(BetterAuthGuard)
  async checkIsNewUser(@Req() req: RequestWithUser) {
    return await this.authService.checkIsNewUser(req.user.id)
  }

  @Get('nickname')
  @UseGuards(BetterAuthGuard)
  async generateRandomNickname() {
    return generateRandomNickname()
  }

  @Patch('onboarding') //온보딩 정보 업데이트 후 user 반환
  @UseGuards(BetterAuthGuard)
  async onboarding(
    @Req() req: RequestWithUser,
    @Body() onboardingDto: OnboardingDto,
  ) {
    return await this.authService.onboarding(req.user.id, onboardingDto)
  }
}
