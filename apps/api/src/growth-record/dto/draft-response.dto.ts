import { ApiProperty } from '@nestjs/swagger'
import { RecordCategory } from '@prisma/client'

export class DraftUpdatedByDto {
  id: number
  name: string
  profileImageUrl: string
}

export class GrowthRecordDraftResponseDto {
  @ApiProperty({ enum: RecordCategory, enumName: 'RecordCategory' })
  category: RecordCategory

  /** FE 폼 스냅샷 (자유 형식 JSON — 발행 시점에만 정식 검증) */
  @ApiProperty({ type: 'object', additionalProperties: true })
  content: unknown

  createdAt: Date
  updatedAt: Date

  /** 마지막 수정자 (탈퇴 시 null) */
  @ApiProperty({ nullable: true, type: DraftUpdatedByDto })
  updatedBy: DraftUpdatedByDto | null
}
