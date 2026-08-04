'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

const MAX_LENGTH = 200

interface FeedbackQuestionCardProps {
  title: string
  isFreeComment: boolean
  text: string
  isRequired: boolean
  canRemove: boolean
  onTextChange: (text: string) => void
  onToggleRequired: () => void
  onRemove: () => void
}

export function FeedbackQuestionCard({
  title,
  isFreeComment,
  text,
  isRequired,
  canRemove,
  onTextChange,
  onToggleRequired,
  onRemove,
}: FeedbackQuestionCardProps) {
  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
      <div className="flex items-center justify-between">
        <h2 className="text-title1_sb_28">{title}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-body2_m_14 text-CoolNeutral-40">필수 질문</span>
            <Switch checked={isRequired} onChange={onToggleRequired} />
          </div>
          <Button
            size="xs"
            onClick={onRemove}
            disabled={!canRemove}
            className="px-4 text-sub4_sb_14"
          >
            삭제하기
          </Button>
        </div>
      </div>
      {!isFreeComment && (
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_LENGTH) onTextChange(e.target.value)
            }}
            placeholder="텍스트를 입력해주세요"
            className="w-full h-32 resize-none rounded-xl border border-neutral-200 p-4 text-body2_m_14 text-CoolNeutral-20 placeholder:text-CoolNeutral-60 focus:outline-none focus:border-CoolNeutral-40 transition-colors"
          />
          <span className="absolute bottom-3 right-4 text-caption1_m_13 text-CoolNeutral-50">
            {text.length}/{MAX_LENGTH}
          </span>
        </div>
      )}
    </div>
  )
}
