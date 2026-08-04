'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useAuthGuard } from '@/lib/useAuthGuard'

const TABS = [
  { label: '프로젝트 성장기록', segment: 'create' },
  { label: '프로젝트 피드백 질문', segment: 'feedback-questions' },
] as const

export default function GrowthRecordEditorLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard()
  const pathname = usePathname()
  const params = useParams()
  const projectId = params.projectId as string
  const activeIndex = pathname.includes('feedback-questions') ? 1 : 0

  useEffect(() => {
    document.title = '성장기록 작성 | PROSEED'
  }, [])

  return (
    <div>
      <div>
        <div className="flex gap-8 px-0">
          {TABS.map((tab, i) => (
            <Link
              key={tab.segment}
              href={`/projects/${projectId}/growthrecord/${tab.segment}`}
              className={`pb-2 text-sub1_sb_18 select-none transition-colors ${
                activeIndex === i
                  ? 'border-b-3 border-CoolNeutral-20 text-CoolNeutral-20'
                  : 'text-CoolNeutral-50 hover:text-CoolNeutral-30'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}
