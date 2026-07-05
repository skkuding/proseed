'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { RotateCcw } from 'lucide-react'
import { FeedbackSortDropdown } from './FeedbackSortDropdown'

export type FilterMode = 'all' | 'adopted'
export type SortValue = 'latest' | 'oldest'

interface FeedbackFilterSortPanelProps {
  filterMode: FilterMode
  sort: SortValue
  onApplyFilter: (mode: FilterMode) => void
  onChangeSort: (value: SortValue) => void
}

const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: 'all', label: '전체 피드백' },
  { value: 'adopted', label: '채택된 피드백만 보기' },
]

export function FeedbackFilterSortPanel({
  filterMode,
  sort,
  onApplyFilter,
  onChangeSort,
}: FeedbackFilterSortPanelProps) {
  const [draftFilter, setDraftFilter] = useState<FilterMode>(filterMode)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative" ref={filterRef}>
        <button
          type="button"
          onClick={() => {
            if (!showFilterDropdown) setDraftFilter(filterMode)
            setShowFilterDropdown((prev) => !prev)
          }}
          className="inline-flex items-center gap-1 rounded-[8px] border border-neutral-90 px-4 py-[11px] text-body1_m_16 text-black hover:bg-neutral-99 transition-colors"
        >
          <Image src="/filter.svg" width={24} height={24} alt="필터" />
          필터
        </button>

        {showFilterDropdown && (
          <div className="absolute right-0 top-full z-20 mt-2 w-[428px] rounded-[12px] border border-neutral-90 bg-white p-6 shadow-md flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-title3_sb_24 text-black">필터 설정하기</h3>
              <button
                type="button"
                onClick={() => setDraftFilter('all')}
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
                    onClick={() => setDraftFilter(option.value)}
                    className={`h-11 rounded-[8px] px-4 py-[9px] text-body1_m_16 transition-colors hover:cursor-pointer ${
                      draftFilter === option.value
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
              <button
                type="button"
                onClick={() => setShowFilterDropdown(false)}
                className="h-12 flex-1 rounded-[8px] border border-CoolNeutral-50 bg-white px-5 py-[13px] text-sub3_sb_16 text-CoolNeutral-20 transition-colors hover:cursor-pointer hover:bg-neutral-99"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyFilter(draftFilter)
                  setShowFilterDropdown(false)
                }}
                className="h-12 flex-1 rounded-[8px] bg-CoolNeutral-20 px-5 py-[13px] text-sub3_sb_16 text-white transition-colors hover:cursor-pointer hover:bg-CoolNeutral-30"
              >
                적용하기
              </button>
            </div>
          </div>
        )}
      </div>

      <FeedbackSortDropdown sort={sort} onChange={onChangeSort} />
    </div>
  )
}
