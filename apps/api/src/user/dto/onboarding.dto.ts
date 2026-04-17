import { JobType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class OnboardingDto {
  @IsEnum(JobType)
  jobType!: JobType

  @IsNotEmpty()
  @IsString()
  nickname!: string
}
