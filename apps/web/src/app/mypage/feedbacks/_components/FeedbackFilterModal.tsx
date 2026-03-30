'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

export type FilterMode = 'all' | 'adopted'

interface FeedbackFilterModalProps {
  mode: FilterMode
  onClose: () => void
  onApply: (mode: FilterMode) => void
}

export function FeedbackFilterModal({ mode, onClose, onApply }: FeedbackFilterModalProps) {
  const [draft, setDraft] = useState<FilterMode>(mode)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[400px] rounded-2xl bg-white p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-title3_sb_24 text-neutral-10">필터 설정하기</h3>
          <button
            onClick={() => setDraft('all')}
            className="inline-flex items-center gap-1.5 text-body3_r_16 text-neutral-40 hover:text-neutral-20 transition-colors"
          >
            <RotateCcw className="size-4" />
            필터 초기화
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sub2_m_18 text-neutral-30">피드백 노출</p>
          <div className="flex gap-2">
            <button
              onClick={() => setDraft('all')}
              className={`h-11 px-5 rounded-[8px] text-body1_m_16 transition-colors ${
                draft === 'all'
                  ? 'bg-CoolNeutral-20 text-white'
                  : 'border border-neutral-90 text-neutral-40 hover:bg-neutral-99'
              }`}
            >
              전체 피드백
            </button>
            <button
              onClick={() => setDraft('adopted')}
              className={`h-11 px-5 rounded-[8px] text-body1_m_16 transition-colors ${
                draft === 'adopted'
                  ? 'bg-CoolNeutral-20 text-white'
                  : 'border border-neutral-90 text-neutral-40 hover:bg-neutral-99'
              }`}
            >
              채택된 피드백만 보기
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-11 px-6 rounded-xl border border-neutral-90 text-body1_m_16 text-neutral-40 hover:bg-neutral-99 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              onApply(draft)
              onClose()
            }}
            className="h-11 px-6 rounded-xl bg-CoolNeutral-20 text-body1_m_16 text-white hover:bg-CoolNeutral-30 transition-colors"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  )
}
