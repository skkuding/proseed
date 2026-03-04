import { JobType } from '@prisma/client'
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator'

export class InviteCollaboratorDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsEnum(JobType)
  role: JobType
}
