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
