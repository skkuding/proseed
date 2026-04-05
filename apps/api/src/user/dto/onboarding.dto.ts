import { JobType } from '@prisma/client'
import { IsNotEmpty, IsString } from 'class-validator'

export class OnboardingDto {
  @IsNotEmpty()
  jobType!: JobType

  @IsNotEmpty()
  @IsString()
  nickname!: string
}
