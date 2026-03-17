import { Controller, Post, Body, Patch, UseGuards, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SocialSignUpDto } from './dto/social-signup.dto'
import { OnboardingDto } from './dto/onboarding.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('social-login') //새로운 유저일때 Post
  async socialLogin(@Body() socialSignUpDto: SocialSignUpDto) {
    return await this.authService.socialLogin(socialSignUpDto)
  }

  @Post('refresh') //accessToken 만료시 재발급하여 로그인 상태 유지
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.updateJwtTokens(body.refreshToken)
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req, @Body() body: { refreshToken: string }) {
    const userId = req.user.userId // 토큰에서 꺼낸 userId
    return this.authService.deleteRefreshToken(userId, body.refreshToken)
  }

  @Patch('onboarding') //온보딩 정보 업데이트 후 user 반환
  @UseGuards(AuthGuard('jwt'))
  async onboarding(@Req() req, @Body() onboardingDto: OnboardingDto) {
    const userId = req.user.userId // 토큰에서 꺼낸 userId
    return this.authService.onboarding(userId, onboardingDto)
  }
}
