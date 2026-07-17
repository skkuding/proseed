import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

export class GetRecentGrowthRecordsDto {
  /** 최근 발행 버전 수 (버전당 4개 직군 카드가 반환됨) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  take?: number = 5
}
