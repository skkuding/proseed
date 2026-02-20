import { Provider } from '@prisma/client'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class SocialSignUpDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string

  @IsNotEmpty()
  readonly provider: Provider

  @IsNotEmpty()
  readonly providerId: string // github, kakao 등에서 로그인 시 받아오게 되는 고유 id
}
