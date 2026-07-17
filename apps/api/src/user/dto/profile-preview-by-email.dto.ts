import { IsEmail, IsNotEmpty } from 'class-validator'

export class ProfilePreviewByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string
}
