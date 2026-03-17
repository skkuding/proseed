import { JobType } from '@prisma/client'

export class OnboardingDto {
  jobType: JobType
  nickname: string
}
