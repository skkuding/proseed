import { JobType } from '@prisma/client'
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator'

export enum ProjectType {
  APP = 'APP',
  WEB = 'WEB',
}

export enum ProjectStatus {
  Available = 'Available',
  MVP = 'MVP',
  Ongoing = 'Ongoing',
  Hiring = 'Hiring',
}

export enum ProjectCategory {
  HEALTHCARE = 'HEALTHCARE',
  FINANCE = 'FINANCE',
  PUBLIC = 'PUBLIC',
  COMMERCE = 'COMMERCE',
  EDUCATION = 'EDUCATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  MOBILITY = 'MOBILITY',
  ENERGY = 'ENERGY',
  REALESTATE = 'REALESTATE',
  LIFESTYLE = 'LIFESTYLE',
  PRODUCTIVITY = 'PRODUCTIVITY',
  COMMUNITY = 'COMMUNITY',
  AI = 'AI',
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsEnum(ProjectType)
  type: ProjectType

  @IsEnum(ProjectStatus)
  status: ProjectStatus

  @IsString()
  @IsNotEmpty()
  oneLineDescription: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsArray()
  @IsEnum(ProjectCategory, { each: true })
  category: ProjectCategory[]

  @IsString()
  @IsNotEmpty()
  contactPath: string

  @IsEnum(JobType)
  leaderJobType: JobType

  @IsString()
  @IsNotEmpty()
  projectLink: string

  @IsString()
  @IsNotEmpty()
  iconKey: string

  @IsString()
  @IsNotEmpty()
  thumbnailKey: string

  // 프로젝트 이미지 최대 8장 (정책). Swagger CLI 플러그인이 maxItems로 뽑도록 리터럴 사용
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  imageKeys: string[]
}
