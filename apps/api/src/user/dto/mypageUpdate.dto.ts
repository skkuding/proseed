import { JobType } from '@prisma/client'
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'

export class MypageUpdateDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsEnum(JobType)
  @IsOptional()
  jobType?: JobType

  @IsString()
  @IsOptional()
  profileImageUrl?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  links?: string[]

  @IsString()
  @IsOptional()
  bio?: string
}
