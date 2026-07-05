'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

type SortValue = 'latest' | 'oldest'

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된 순' },
]

interface FeedbackSortDropdownProps {
  sort: SortValue
  onChange: (value: SortValue) => void
}

export function FeedbackSortDropdown({ sort, onChange }: FeedbackSortDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? '최신순'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 rounded-[8px] border border-neutral-90 pl-6 pr-4 py-[11px] text-body1_m_16 text-black hover:bg-neutral-99 transition-colors"
      >
        {currentLabel}
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-[140px] overflow-hidden rounded-[8px] border border-neutral-90 bg-white shadow-md">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={`w-full px-4 py-3 text-left text-body1_m_16 transition-colors hover:bg-neutral-99 ${
                sort === option.value ? 'text-CoolNeutral-20 font-semibold' : 'text-black'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
