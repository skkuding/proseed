'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { JOB_TABS, jobTabToPersonLabel } from '@/app/_utils/projectConstants'

const JOB_OPTIONS = JOB_TABS

interface JobDropdownProps {
  value: string
  onChange: (job: string) => void
  readOnly?: boolean
}

export function JobDropdown({ value, onChange, readOnly = false }: JobDropdownProps) {
  const [jobOpen, setJobOpen] = useState(false)
  const jobRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (jobRef.current && !jobRef.current.contains(e.target as Node)) {
        setJobOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex flex-1 min-w-0 items-center gap-2">
      <div className="relative flex-1 min-w-0" ref={jobRef}>
        <button
          type="button"
          onClick={() => !readOnly && setJobOpen((prev) => !prev)}
          disabled={readOnly}
          className={`flex w-full items-center justify-between rounded-[8px] border border-neutral-95 px-4 py-3 ${readOnly ? 'bg-neutral-99 cursor-default' : ''}`}
        >
          <span className={`text-body1_m_16 ${value ? 'text-CoolNeutral-20' : 'text-neutral-80'}`}>
            {value ? jobTabToPersonLabel(value) : '직무를 선택해주세요'}
          </span>
          {!readOnly && (
            <Image
              src="/arrow2_down.svg"
              width={24}
              height={24}
              alt=""
              className={`shrink-0 transition-transform duration-200 ${jobOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        {jobOpen && !readOnly && (
          <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-[8px] border border-neutral-95 bg-white shadow-md">
            {JOB_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setJobOpen(false)
                }}
                className="w-full px-4 py-3 text-left text-body1_m_16 text-CoolNeutral-20 transition-colors hover:bg-neutral-99"
              >
                {jobTabToPersonLabel(option)}
              </button>
            ))}
          </div>
        )}
      </div>
      {!readOnly && <div className="w-[104px] shrink-0" />}
    </div>
  )
}
