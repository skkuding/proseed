'use client'

import { Switch } from '@/components/ui/switch'

interface GeneralTabToggleCardProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function GeneralTabToggleCard({ checked, onChange }: GeneralTabToggleCardProps) {
  return (
    <div
      className={`flex items-center justify-between bg-white rounded-[12px] p-7 border transition-colors ${
        checked ? 'border-primary' : 'border-transparent shadow-[0_4px_12px_0_rgba(27,29,38,0.06)]'
      }`}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-title1_sb_28">기타 직군 추가하기</h2>
        <p className="text-body3_r_16 text-CoolNeutral-30">
          마케터 또는 AI 엔지니어와 같은 직군의 성장기록을 발행할 수 있어요
        </p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}
