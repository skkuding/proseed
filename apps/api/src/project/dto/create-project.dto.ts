import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator'

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

  @IsString()
  @IsNotEmpty()
  projectLink: string

  @IsString()
  @IsNotEmpty()
  iconKey: string

  @IsString()
  @IsNotEmpty()
  thumbnailKey: string

  @IsArray()
  @IsString({ each: true })
  imageKeys: string[]
}
