import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class ProfilePreviewByEmailDto {
  @ApiProperty({
    description: '검색할 유저의 이메일 주소',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string
}
