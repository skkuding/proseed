'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type FeedbackAdoptionFilter = 'all' | 'adopted'

interface FeedbackAdoptionFilterButtonProps {
  value: FeedbackAdoptionFilter
  onApply: (mode: FeedbackAdoptionFilter) => void
}

const FILTER_OPTIONS: { value: FeedbackAdoptionFilter; label: string }[] = [
  { value: 'all', label: '전체 피드백' },
  { value: 'adopted', label: '채택된 피드백만 보기' },
]

export function FeedbackAdoptionFilterButton({
  value,
  onApply,
}: FeedbackAdoptionFilterButtonProps) {
  const [draft, setDraft] = useState<FeedbackAdoptionFilter>(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (!open) setDraft(value)
          setOpen((prev) => !prev)
        }}
        className="inline-flex items-center gap-1 rounded-[8px] border border-neutral-90 px-4 py-[11px] text-body1_m_16 text-black hover:bg-neutral-99 hover:cursor-pointer transition-colors"
      >
        <Image src="/filter.svg" width={24} height={24} alt="필터" />
        필터
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-[428px] rounded-[12px] border border-neutral-90 bg-white p-6 shadow-md flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-title3_sb_24 text-black">필터 설정하기</h3>
            <button
              type="button"
              onClick={() => setDraft('all')}
              className="inline-flex items-center gap-1 text-body2__m_14 text-neutral-40 transition-colors hover:cursor-pointer hover:text-neutral-30"
            >
              <RotateCcw className="size-4" />
              필터 초기화
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-body1__m_16 text-neutral-30">피드백 노출</p>
            <div className="flex gap-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraft(option.value)}
                  className={`h-11 rounded-[8px] px-4 py-[9px] text-body1_m_16 transition-colors hover:cursor-pointer ${
                    draft === option.value
                      ? 'bg-CoolNeutral-30 text-white'
                      : 'bg-neutral-99 text-neutral-30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setOpen(false)}
              className="flex-1 text-sub3_sb_16"
            >
              취소
            </Button>
            <Button
              size="md"
              onClick={() => {
                onApply(draft)
                setOpen(false)
              }}
              className="flex-1 text-sub3_sb_16"
            >
              적용하기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
