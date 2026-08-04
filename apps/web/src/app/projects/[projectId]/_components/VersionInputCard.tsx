'use client'

import { FieldBadge } from '@/components/FieldBadge'

export type VersionValue = { major: string; minor: string; patch: string }

interface VersionInputCardProps {
  version: VersionValue
  onChange: (version: VersionValue) => void
}

const inputClassName =
  'w-[42px] h-[50px] text-center rounded-lg border border-neutral-200 text-title3_sb_20 focus:outline-none focus:border-CoolNeutral-40 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

export function VersionInputCard({ version, onChange }: VersionInputCardProps) {
  return (
    <div className="flex justify-between bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-title1_sb_28">성장기록 버전</h2>
            <FieldBadge type="필수" />
          </div>
        </div>
        <p className="text-body3_r_16 text-CoolNeutral-40">
          업데이트하는 성장기록의 버전을 입력해주세요
        </p>
      </div>
      <div className="flex items-end gap-1 mt-1">
        <span className="text-title3_sb_20 text-CoolNeutral-40">v</span>
        <input
          type="number"
          min={0}
          value={version.major}
          onChange={(e) => onChange({ ...version, major: e.target.value })}
          placeholder="0"
          className={inputClassName}
        />
        <span className="text-title3_sb_20 text-CoolNeutral-40">.</span>
        <input
          type="number"
          min={0}
          value={version.minor}
          onChange={(e) => onChange({ ...version, minor: e.target.value })}
          placeholder="0"
          className={inputClassName}
        />
        <span className="text-title3_sb_20 text-CoolNeutral-40">.</span>
        <input
          type="number"
          min={0}
          value={version.patch}
          onChange={(e) => onChange({ ...version, patch: e.target.value })}
          placeholder="0"
          className={inputClassName}
        />
      </div>
    </div>
  )
}
