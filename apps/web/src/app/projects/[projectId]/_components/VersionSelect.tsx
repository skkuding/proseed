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
}

export function VersionSelect({ versions, value, onChange }: VersionSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 px-4 text-body1_m_16 rounded-[8px] hover:cursor-pointer border-neutral-90 [&_svg]:size-5">
        <SelectValue placeholder="업데이트 버전 -">
          {versions.length > 0 &&
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
      </SelectContent>
    </Select>
  )
}
