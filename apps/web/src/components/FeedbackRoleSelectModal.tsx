'use client'

import { useEffect, useState } from 'react'
import { X, Dot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { getFeedbackQuestions, type FeedbackQuestionItemDto } from '@/lib/api'
import { JOB_TABS, RECORD_CATEGORY_TO_API, type JobTab } from '@/app/_utils/projectConstants'

const TABS = JOB_TABS
type TabLabel = JobTab

interface FeedbackRoleSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedRoles: TabLabel[]) => void
  projectId: string
  versionId: string
}

export function FeedbackRoleSelectModal({
  isOpen,
  onClose,
  onConfirm,
  projectId,
  versionId,
}: FeedbackRoleSelectModalProps) {
  const [activeTab, setActiveTab] = useState<TabLabel>('기획')
  const [selectedRoles, setSelectedRoles] = useState<Set<TabLabel>>(new Set(['기획']))
  const [questions, setQuestions] = useState<FeedbackQuestionItemDto[]>([])

  useEffect(() => {
    if (!isOpen) return
    getFeedbackQuestions(projectId, versionId)
      .then(setQuestions)
      .catch(() => setQuestions([]))
  }, [isOpen, projectId, versionId])

  if (!isOpen) return null

  const activeCategory = RECORD_CATEGORY_TO_API[activeTab]
  const tabQuestions = questions
    .filter((q) => q.category === activeCategory)
    .sort((a, b) => a.order - b.order)

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
          <Button variant="iconMuted" size="bare" onClick={onClose}>
            <X className="size-6" />
          </Button>
        </div>

        {/* Role tabs */}
        <RoleFilterTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabLabel)}
        />

        {/* Question preview */}
        <div className="flex flex-col gap-3 bg-neutral-99 rounded-xl p-5">
          <p className="text-sub3_sb_16 text-CoolNeutral-20">{activeTab} 피드백 질문 미리보기</p>
          <div className="flex flex-col gap-1">
            {tabQuestions.map((q) => (
              <div key={q.id} className="flex items-start gap-1">
                <Dot className="size-4 shrink-0 mt-0.5 text-CoolNeutral-40" />
                <span className="text-body2_m_14 text-CoolNeutral-40">{q.title}</span>
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
              {activeTab} 직군의 피드백을 작성할게요
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
          <Button variant="outline" size="sm" onClick={onClose} className="px-6 text-sub3_sb_16">
            취소하기
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={selectedRoles.size === 0}
            className="px-6 text-sub3_sb_16"
          >
            피드백 작성 시작하기
          </Button>
        </div>
      </div>
    </div>
  )
}
