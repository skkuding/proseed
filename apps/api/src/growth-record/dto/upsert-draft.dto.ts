import { IsObject } from 'class-validator'

export class UpsertDraftDto {
  //FE 폼 스냅샷 — draft 단계에서는 형식을 강제하지 않고 발행 시점에 정식 검증
  @IsObject()
  content!: Record<string, unknown>
}
