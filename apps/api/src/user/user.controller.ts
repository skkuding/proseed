import { Controller, Get, Body, Patch, Req } from '@nestjs/common'
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'

import { UserService } from './user.service'

import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { generateRandomNickname } from 'src/user/utils/generateRandomNickname'
import { OnboardingDto } from './dto/onboarding.dto'

//전역 가드로 전 라우트 인증 필수
@ApiTags('User')
@ApiCookieAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('check') //기존 or 신규 유저인지 확인 + 초기 생성 닉네임 반환
  async checkIsNewUser(@Req() req: RequestWithUser) {
    return await this.userService.checkIsNewUser(req.user.id)
  }

  @Get('nickname')
  generateRandomNickname() {
    return { nickname: generateRandomNickname() }
  }

  @Patch('onboarding') //온보딩 정보 업데이트 후 user 반환
  async onboarding(
    @Req() req: RequestWithUser,
    @Body() onboardingDto: OnboardingDto,
  ) {
    return await this.userService.onboarding(req.user.id, onboardingDto)
  }
}
