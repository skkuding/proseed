import {
  Controller,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'

import { UserService } from './user.service'

import { Public } from 'src/auth/decorators/public.decorator'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { generateRandomNickname } from 'src/user/utils/generateRandomNickname'
import { OnboardingDto } from './dto/onboarding.dto'
import {
  NicknameResponseDto,
  UserCheckResponseDto,
  UserProfileResponseDto,
  UserResponseDto,
} from './dto/user-response.dto'
import { BetterAuthGuard } from 'src/auth/guards/better-auth.guard'

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCookieAuth()
  @UseGuards(BetterAuthGuard)
  @Get('check') //기존 or 신규 유저인지 확인 + 초기 생성 닉네임 반환
  async checkIsNewUser(
    @Req() req: RequestWithUser,
  ): Promise<UserCheckResponseDto> {
    return await this.userService.checkIsNewUser(req.user.id)
  }

  @ApiCookieAuth()
  @UseGuards(BetterAuthGuard)
  @Get('nickname')
  generateRandomNickname(): NicknameResponseDto {
    return { nickname: generateRandomNickname() }
  }

  @ApiCookieAuth()
  @UseGuards(BetterAuthGuard)
  @Patch('onboarding') //온보딩 정보 업데이트 후 user 반환
  async onboarding(
    @Req() req: RequestWithUser,
    @Body() onboardingDto: OnboardingDto,
  ): Promise<UserResponseDto> {
    return await this.userService.onboarding(req.user.id, onboardingDto)
  }

  //프로젝트 상세(비로그인 열람 가능)의 팀원 프로필용 — 공개 정보만 반환
  @Public()
  @Get(':userId/profile')
  async getOtherUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserProfileResponseDto> {
    return await this.userService.getOtherUserProfile(userId)
  }
}
