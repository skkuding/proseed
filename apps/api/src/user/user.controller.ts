import {
  Controller,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
  Query,
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
  OtherUserProfileResponseDto,
  UserResponseDto,
  ProfilePreviewResponseDto,
} from './dto/user-response.dto'
import { BetterAuthGuard } from 'src/auth/guards/better-auth.guard'
import { MypageJoinedProjectListDto } from 'src/project/dto/project-response.dto'
import { ProjectService } from 'src/project/project.service'
import { ProfilePreviewByEmailDto } from './dto/profile-preview-by-email.dto'

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
  ) {}

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

  /**
   * 다른 팀원의 공개 프로필 미리보기를 이메일 주소를 통해 조회합니다.
   *
   * @param email 검색 시 입력하는 다른 팀원의 이메일 주소
   * @returns 프로필 미리보기에 필요한 정보: name & jobType
   */
  @ApiCookieAuth()
  @UseGuards(BetterAuthGuard)
  @Get('profile/preview')
  async getProfilePreviewByEmail(
    @Query() query: ProfilePreviewByEmailDto,
  ): Promise<ProfilePreviewResponseDto> {
    return this.userService.getProfilePreviewByEmail(query.email)
  }

  /**
   * 다른 팀원의 공개 프로필을 조회합니다. (접근 경로: 프로젝트 상세)
   *
   * @param userId 다른 팀원의 유저 아이디
   * @returns 댜른 팀원의 공개 프로필 정보
   */
  @Public()
  @Get(':userId/profile')
  async getOtherUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<OtherUserProfileResponseDto> {
    return await this.userService.getOtherUserProfile(userId)
  }

  /**
   * 다른 팀원의 공개 프로필에서 참여중인 프로젝트 목록을 조회합니다.
   *
   * @param userId 다른 팀원의 유저 아이디
   * @returns 다른 팀원이 참여중인 프로젝트 목록
   */
  @Public()
  @Get(':userId/profile/projects')
  async getOtherUserJoinedProjects(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<MypageJoinedProjectListDto[]> {
    return this.projectService.getJoinedProjects(userId)
  }
}
