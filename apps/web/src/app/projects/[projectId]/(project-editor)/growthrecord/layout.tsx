'use client'

import { usePathname } from 'next/navigation'

const TABS = ['프로젝트 성장기록', '프로젝트 피드백 질문'] as const

export default function GrowthRecordEditorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeIndex = pathname.includes('feedback-questions') ? 1 : 0

  return (
    <div>
      <div>
        <div className="flex gap-8 px-0">
          {TABS.map((tab, i) => (
            <span
              key={tab}
              className={`pb-2 text-sub1_sb_18 cursor-default select-none transition-colors ${
                activeIndex === i
                  ? 'border-b-3 border-CoolNeutral-20 text-CoolNeutral-20'
                  : 'text-CoolNeutral-50'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}
