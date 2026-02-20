import { IsEmail, IsNotEmpty } from 'class-validator'

export class InviteCollaboratorDto {
  @IsEmail()
  @IsNotEmpty()
  email: string
}
