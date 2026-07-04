import { ApiProperty } from '@nestjs/swagger'
import {
  JobType,
  ProjectCategory,
  ProjectMemberRole,
  ProjectStatus,
  ProjectType,
} from '@prisma/client'

export class ProjectVersionCountDto {
  versions: number
}

export class ProjectListItemDto {
  id: number
  title: string
  oneLineDescription: string

  @ApiProperty({
    enum: ProjectCategory,
    enumName: 'ProjectCategory',
    isArray: true,
  })
  category: ProjectCategory[]

  /** raw S3 key (presigned 변환은 P0-5 미해결) */
  thumbnailUrl: string

  _count: ProjectVersionCountDto
  feedbackCount: number
}

export class ProjectListResponseDto {
  data: ProjectListItemDto[]

  @ApiProperty({ nullable: true, type: Number })
  nextCursor: number | null

  hasNextPage: boolean
}

export class ProjectResponseDto {
  id: number
  title: string
  createdById: number

  @ApiProperty({ enum: ProjectType, enumName: 'ProjectType' })
  type: ProjectType

  @ApiProperty({ enum: ProjectStatus, enumName: 'ProjectStatus' })
  status: ProjectStatus

  oneLineDescription: string
  description: string

  @ApiProperty({
    enum: ProjectCategory,
    enumName: 'ProjectCategory',
    isArray: true,
  })
  category: ProjectCategory[]

  contactPath: string
  projectLink: string
  iconUrl: string
  thumbnailUrl: string
  createdAt: Date
  updatedAt: Date
}

export class ProjectImageDto {
  order: number
  url: string
}

export class ProjectMemberUserDto {
  name: string
  profileImageUrl: string
}

export class ProjectMemberDto {
  id: number
  user: ProjectMemberUserDto

  @ApiProperty({ enum: JobType, enumName: 'JobType' })
  role: JobType
}

export class ProjectDetailResponseDto extends ProjectResponseDto {
  images: ProjectImageDto[]
  projectRoles: ProjectMemberDto[]

  /** 요청자가 이 프로젝트의 멤버인지 (비로그인 시 false) */
  isMyProject: boolean
}

export class ProjectRoleResponseDto {
  id: number
  userId: number
  projectId: number

  @ApiProperty({ enum: JobType, enumName: 'JobType' })
  role: JobType

  @ApiProperty({ enum: ProjectMemberRole, enumName: 'ProjectMemberRole' })
  projectMemberRole: ProjectMemberRole
}

export class ProjectVersionListItemDto {
  id: number
  version: string
  createdAt: Date
}
