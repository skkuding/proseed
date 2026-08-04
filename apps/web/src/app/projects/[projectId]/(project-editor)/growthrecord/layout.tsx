'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useAuthGuard } from '@/lib/useAuthGuard'
import { useLeaveGuard } from '@/lib/useLeaveGuard'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'
import { ConfirmModal } from '@/components/ConfirmModal'

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
  // 성장기록/피드백 질문 탭은 같은 레이아웃 아래서만 오가므로(내부 이동은 replace라 히스토리가
  // 쌓이지 않음) 뒤로가기 방어는 에디터 진입 시 한 번만 걸면 됨 — 탭마다 걸면 전환할 때마다
  // 더미 엔트리가 계속 쌓여 뒤로가기를 여러 번 눌러야 빠져나가는 문제가 생긴다
  const { showLeaveModal, setShowLeaveModal, onLeaveConfirm } = useLeaveGuard()
  // 성장기록 에디터 진입 시 한 번만 안내 — 탭 전환은 같은 레이아웃 아래서 일어나 재마운트되지 않음
  const [showGeneralCategoryInfo, setShowGeneralCategoryInfo] = useState(true)

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
              replace
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

      <LeaveConfirmModal
        isOpen={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={onLeaveConfirm}
      />

      <ConfirmModal
        isOpen={showGeneralCategoryInfo}
        title="기타 직군이란?"
        description="기타 직군은 마케터와 같은 타 직군의 피드백을 받고자 할 때 활용됩니다. 이 직군은 피드백 질문을 작성하지 않으면 타 사용자들에게 노출되지 않아요"
        onConfirm={() => setShowGeneralCategoryInfo(false)}
      />
    </div>
  )
}
