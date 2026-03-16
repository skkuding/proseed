import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { SocialSignUpDto } from './dto/social-signup.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('social-login')
  async socialLogin(@Body() socialSignUpDto: SocialSignUpDto) {
    return await this.authService.socialLogin(socialSignUpDto)
  }
}
