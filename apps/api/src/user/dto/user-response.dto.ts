import { ApiProperty } from '@nestjs/swagger'
import { JobType, UserRole } from '@prisma/client'

export class UserCheckResponseDto {
  /** 온보딩(jobType 설정) 미완료 여부 */
  isNewUser!: boolean

  nickname!: string
}

export class NicknameResponseDto {
  nickname!: string
}

export class MyProfileAccountDto {
  providerId!: string
}

export class MyProfileResponseDto {
  name!: string
  email!: string

  @ApiProperty({ type: [MyProfileAccountDto] })
  accounts!: MyProfileAccountDto[]

  @ApiProperty({ enum: JobType, enumName: 'JobType', nullable: true })
  jobType!: JobType | null

  profileImageUrl!: string
  skills!: string[]
  links!: string[]

  @ApiProperty({ nullable: true, type: String })
  bio!: string | null

  ownedTicketCount!: number
  joinedProjectCount!: number
  feedbackCount!: number
}

export class MyProfileUpdateResponseDto {
  name!: string

  @ApiProperty({ enum: JobType, enumName: 'JobType', nullable: true })
  jobType!: JobType | null

  profileImageUrl!: string
  skills!: string[]
  links!: string[]

  @ApiProperty({ nullable: true, type: String })
  bio!: string | null
}

/** 다른 유저의 공개 프로필 — email/티켓 등 민감 정보 제외 */
export class UserProfileResponseDto {
  id!: number
  name!: string

  @ApiProperty({ enum: JobType, enumName: 'JobType', nullable: true })
  jobType!: JobType | null

  profileImageUrl!: string
  skills!: string[]
  links!: string[]

  @ApiProperty({ nullable: true, type: String })
  bio!: string | null

  joinedProjectCount!: number
  feedbackCount!: number
}

export class UserResponseDto {
  id!: number
  name!: string
  email!: string
  emailVerified!: boolean
  profileImageUrl!: string
  createdAt!: Date
  updatedAt!: Date
  ownedTicketCount!: number

  @ApiProperty({ enum: JobType, enumName: 'JobType', nullable: true })
  jobType!: JobType | null

  @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
  userRole!: UserRole

  skills!: string[]
  links!: string[]

  @ApiProperty({ nullable: true, type: String })
  bio!: string | null
}
