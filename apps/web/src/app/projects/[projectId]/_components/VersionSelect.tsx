'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProjectVersionListItemDto } from '@/lib/api'

type VersionSelectProps = {
  versions: ProjectVersionListItemDto[]
  value: string
  onChange: (value: string) => void
  // 피드백 탭에서만 사용 — 성장기록에는 "자유 성장기록" 같은 개념이 없어 기본은 false
  showFreeformOption?: boolean
}

// 성장기록(버전)이 생기기 전에 남긴 자유 피드백을 가리키는 값 — 실제 버전 id와 겹치지 않는 문자열
export const FREEFORM_VERSION_VALUE = 'freeform'

export function VersionSelect({
  versions,
  value,
  onChange,
  showFreeformOption = false,
}: VersionSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 px-4 text-body1_m_16 rounded-[8px] hover:cursor-pointer border-neutral-90 [&_svg]:size-5">
        <SelectValue placeholder="업데이트 버전 -">
          {value === FREEFORM_VERSION_VALUE
            ? '자유 피드백'
            : versions.length > 0 &&
              `업데이트 버전 ${versions.find((v) => v.id.toString() === value)?.version}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper">
        {versions.map((v) => (
          <SelectItem
            key={v.id}
            value={v.id.toString()}
            className="text-body1_m_16! hover:cursor-pointer"
          >
            버전 {v.version}
          </SelectItem>
        ))}
        {/* 성장기록 작성 전에 남겨진 자유 피드백 — 버전이 생긴 뒤에도 계속 조회 가능해야 한다 */}
        {showFreeformOption && (
          <SelectItem
            value={FREEFORM_VERSION_VALUE}
            className="text-body1_m_16! hover:cursor-pointer"
          >
            자유 피드백
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
