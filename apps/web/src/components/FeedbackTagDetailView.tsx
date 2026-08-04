'use client'

import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, Dot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeedbackUnlockPopover } from '@/app/projects/[projectId]/_components/FeedbackUnlockPopover'
import type { SubmissionCard } from './FeedbackTagCard'

interface FeedbackTagDetailViewProps {
  card: SubmissionCard
  activeTabLabel: string
  isSelected: boolean
  canSelect: boolean
  selectedQuestionId: number | null
  onSelectQuestion: (questionId: number) => void
  onBack: () => void
  onToggleSelect: () => void
  /** 프로젝트 팀원만 unlock 가능 */
  canUnlock: boolean
  ticketCount: number | null
  isUnlocking: boolean
  unlockErrorMessage: string | null
  onUnlock: () => void
}

export function FeedbackTagDetailView({
  card,
  activeTabLabel,
  isSelected,
  canSelect,
  selectedQuestionId,
  onSelectQuestion,
  onBack,
  onToggleSelect,
  canUnlock,
  ticketCount,
  isUnlocking,
  unlockErrorMessage,
  onUnlock,
}: FeedbackTagDetailViewProps) {
  const currentQuestion =
    card.questions.find((q) => q.questionId === selectedQuestionId) ?? card.questions[0]

  return (
    <div className="max-h-165.5 overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-10">
          <div className="flex items-center gap-2">
            <Button variant="iconMuted" size="bare" onClick={onBack}>
              <ChevronLeftIcon className="size-9" />
            </Button>
            <h2 className="text-head3_sb_36">피드백 자세히 보기</h2>
          </div>
          <Button
            size="sm"
            variant={isSelected ? 'outline' : 'default'}
            onClick={onToggleSelect}
            className="px-6 text-sub3_sb_16"
            disabled={!isSelected && !canSelect}
          >
            {isSelected ? '선택 해제하기' : '피드백 선택하기'}
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 bg-white rounded-[12px] mx-7 mb-10">
          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="relative w-15 h-15 rounded-full overflow-hidden shrink-0 bg-neutral-100">
              <Image
                src={card.author.profileImageUrl}
                alt={card.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-body2_m_14 text-primary-strong">{activeTabLabel}</span>
              <span className="text-title3_sb_24">{card.author.name}</span>
            </div>
          </div>

          {/* One-line review */}
          <div className="bg-[#0000000A] border border-[#00000033] rounded-[12px] px-4 py-3">
            <p className="text-body1_m_16 truncate">{card.oneLineReview}</p>
          </div>

          {/* Q&A */}
          <div className="flex min-h-50 gap-6">
            {/* Sidebar */}
            <div className="w-64 shrink-0 p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] rounded-[8px] flex flex-col">
              <p className="text-title5_sb_20 mb-3">피드백 답변 바로가기</p>
              <div className="flex flex-col">
                {card.questions.map((q) => {
                  const isQuestionSelected = selectedQuestionId === q.questionId
                  return (
                    <button
                      key={q.questionId}
                      onClick={() => onSelectQuestion(q.questionId)}
                      className={`flex justify-between items-center text-left w-full px-1 py-2 rounded-lg text-body2_m_14 text-CoolNeutral-20 transition-colors hover:bg-neutral-99 hover:cursor-pointer ${
                        isQuestionSelected ? 'bg-neutral-99' : ''
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        <Dot className="size-4 shrink-0" />
                        <span className="max-w-37.5 truncate">{q.questionTitle}</span>
                      </div>
                      <ChevronRightIcon className="size-5 shrink-0 text-[#7B7B7B]" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {currentQuestion &&
                (card.isUnlocked ? (
                  <div className="flex flex-col gap-6">
                    <h3 className="text-title5_sb_20">{currentQuestion.questionTitle}</h3>
                    <p className="text-body3_r_16 text-CoolNeutral-20 leading-relaxed whitespace-pre-line">
                      {currentQuestion.content}
                    </p>
                  </div>
                ) : (
                  // 프로젝트 피드백 탭(FeedbackSubmissionDetail)과 동일한 스켈레톤+unlock 팝오버 패턴
                  <div className="relative min-h-50">
                    <div
                      aria-hidden
                      className="flex flex-col gap-3 blur-[6px] select-none pointer-events-none"
                    >
                      <div className="h-6 w-2/3 rounded bg-neutral-95" />
                      <div className="h-4 w-full rounded bg-neutral-95" />
                      <div className="h-4 w-full rounded bg-neutral-95" />
                      <div className="h-4 w-5/6 rounded bg-neutral-95" />
                      <div className="grid grid-cols-4 gap-x-2 gap-y-4 mt-5">
                        {Array.from({ length: 4 }).map((_, idx) => (
                          <div key={idx} className="aspect-video rounded-xl bg-neutral-95" />
                        ))}
                      </div>
                    </div>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FeedbackUnlockPopover
                        canUnlock={canUnlock}
                        ticketCount={ticketCount}
                        isUnlocking={isUnlocking}
                        errorMessage={unlockErrorMessage}
                        onUnlock={onUnlock}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
