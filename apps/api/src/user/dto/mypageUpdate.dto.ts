import { JobType } from '@prisma/client'
import { IsArray, IsEnum, IsString } from 'class-validator'

export class MypageUpdateDto {
  @IsString()
  name?: string

  @IsEnum(JobType)
  jobType?: JobType

  @IsString()
  profileImageUrl?: string

  @IsArray()
  skills?: string[]

  @IsArray()
  links?: string[]

  @IsString()
  bio?: string
}
