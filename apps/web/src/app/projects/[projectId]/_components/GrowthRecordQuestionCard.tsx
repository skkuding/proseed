'use client'

import { FieldBadge } from '@/components/FieldBadge'
import Editor from '@/components/mdxEditor/Editor'

interface GrowthRecordQuestionCardProps {
  title: string
  isRequired: boolean
  value: string
  onChange: (value: string) => void
}

export function GrowthRecordQuestionCard({
  title,
  isRequired,
  value,
  onChange,
}: GrowthRecordQuestionCardProps) {
  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
      <div className="flex items-center gap-2">
        <h2 className="text-title1_sb_28">{title}</h2>
        {isRequired && <FieldBadge type="필수" />}
      </div>
      <Editor markdown={value} onChange={onChange} width="100%" height={252} />
    </div>
  )
}
