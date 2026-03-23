'use client'

import { useState } from 'react'
import { X, Dot } from 'lucide-react'
import feedbackQuestions from '@/app/_mockdata/project-detail/project-feedbackQuestion.json'

const TABS = ['기획자', '디자이너', '개발자', '기타'] as const
type TabLabel = (typeof TABS)[number]

const TAB_TO_CATEGORY: Record<TabLabel, keyof typeof feedbackQuestions.questions> = {
  기획자: 'plan',
  디자이너: 'design',
  개발자: 'dev',
  기타: 'general',
}

const TAB_TO_ROLE_LABEL: Record<TabLabel, string> = {
  기획자: '기획',
  디자이너: '디자인',
  개발자: '개발',
  기타: '기타',
}

interface FeedbackRoleSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedRoles: TabLabel[]) => void
}

export function FeedbackRoleSelectModal({
  isOpen,
  onClose,
  onConfirm,
}: FeedbackRoleSelectModalProps) {
  const [activeTab, setActiveTab] = useState<TabLabel>('기획자')
  const [selectedRoles, setSelectedRoles] = useState<Set<TabLabel>>(new Set(['기획자']))

  if (!isOpen) return null

  const questions = feedbackQuestions.questions[TAB_TO_CATEGORY[activeTab]]

  const toggleRole = (tab: TabLabel) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev)
      if (next.has(tab)) {
        next.delete(tab)
      } else {
        next.add(tab)
      }
      return next
    })
  }

  const handleConfirm = () => {
    const ordered = TABS.filter((t) => selectedRoles.has(t))
    if (ordered.length === 0) return
    onConfirm(ordered)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[700px] bg-white rounded-2xl p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-title1_sb_28 text-CoolNeutral-20">
            어떤 직군의 피드백을 작성하시겠어요?
          </h2>
          <button
            onClick={onClose}
            className="text-CoolNeutral-40 hover:text-CoolNeutral-20 hover:cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Role tabs */}
        <div className="flex gap-1 bg-neutral-99 border border-neutral-200 rounded-full p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 hover:cursor-pointer rounded-full text-body1_m_16 transition-colors ${
                activeTab === tab
                  ? 'bg-CoolNeutral-20 text-white'
                  : 'text-CoolNeutral-40 hover:text-CoolNeutral-20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Question preview */}
        <div className="flex flex-col gap-3 bg-neutral-99 rounded-xl p-5">
          <p className="text-sub3_sb_16 text-CoolNeutral-20">{activeTab} 피드백 질문 미리보기</p>
          <div className="flex flex-col gap-1">
            {questions.map((q) => (
              <div key={q.questionId} className="flex items-start gap-1">
                <Dot className="size-4 shrink-0 mt-0.5 text-CoolNeutral-40" />
                <span className="text-body2_m_14 text-CoolNeutral-40">{q.questionTitle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role selection checkbox */}
        <button
          onClick={() => toggleRole(activeTab)}
          className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-5 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
        >
          <div className="flex flex-col gap-1 text-left">
            <p className="text-sub3_sb_16 text-CoolNeutral-20">
              {TAB_TO_ROLE_LABEL[activeTab]} 직군의 피드백을 작성할게요
            </p>
            <p className="text-body2_m_14 text-CoolNeutral-40">
              해당 직군뿐만 아니라, 선택하신 다른 직군에 대한 피드백도 함께 작성하실 수 있어요.
            </p>
          </div>
          <div
            className={`size-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
              selectedRoles.has(activeTab)
                ? 'bg-CoolNeutral-20 border-CoolNeutral-20'
                : 'border-neutral-300 bg-white'
            }`}
          >
            {selectedRoles.has(activeTab) && (
              <svg
                viewBox="0 0 12 10"
                className="size-3 text-white fill-none stroke-current stroke-2"
              >
                <polyline points="1,5 4.5,8.5 11,1" />
              </svg>
            )}
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-12 px-6 rounded-xl border border-neutral-200 text-sub3_sb_16 text-CoolNeutral-20 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
          >
            취소하기
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedRoles.size === 0}
            className="h-12 px-6 rounded-xl bg-CoolNeutral-20 text-sub3_sb_16 text-white hover:bg-CoolNeutral-30 hover:cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            피드백 작성 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
