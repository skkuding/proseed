'use client'

import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, Dot } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
}: FeedbackTagDetailViewProps) {
  const currentQuestion =
    card.questions.find((q) => q.questionId === selectedQuestionId) ?? card.questions[0]

  return (
    <div className="max-h-165.5 overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <Button variant="iconMuted" size="bare" onClick={onBack}>
              <ChevronLeftIcon className="size-6" />
            </Button>
            <h2 className="text-title1_sb_28 text-CoolNeutral-20">피드백 자세히 보기</h2>
          </div>
          <Button
            size="sm"
            onClick={onToggleSelect}
            className={`px-6 text-sub3_sb_16 ${
              isSelected ? 'bg-neutral-200 text-CoolNeutral-40 hover:bg-neutral-300' : ''
            }`}
            disabled={!isSelected && !canSelect}
          >
            {isSelected ? '선택 해제하기' : '피드백 선택하기'}
          </Button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 flex flex-col gap-5 bg-white rounded-xl mx-7 mb-10">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="relative w-17.5 h-17.5 rounded-full overflow-hidden shrink-0 bg-neutral-100">
              <Image
                src={card.author.profileImageUrl}
                alt={card.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-body2_m_14 text-primary-strong">{activeTabLabel}</span>
              <span className="text-[28px] font-semibold tracking-[-0.04em]">
                {card.author.name}
              </span>
            </div>
          </div>

          {/* One-line review */}
          <div className="bg-[#0000000A] border border-[#00000033] rounded-xl px-6 py-5">
            <p className="text-title4_m_20 leading-[130%] truncate">{card.oneLineReview}</p>
          </div>

          {/* Q&A */}
          <div className="flex min-h-50 gap-6">
            {/* Sidebar */}
            <div className="w-62.5 shrink-0 p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] rounded-lg flex flex-col">
              <p className="text-title3_sb_20 mb-3">피드백 답변 바로가기</p>
              <div className="flex flex-col">
                {card.questions.map((q) => {
                  const isQuestionSelected = selectedQuestionId === q.questionId
                  return (
                    <button
                      key={q.questionId}
                      onClick={() => onSelectQuestion(q.questionId)}
                      className={`flex justify-between items-center text-left w-full px-1 py-2 rounded-lg text-body1_m_16 text-CoolNeutral-20 transition-colors hover:bg-neutral-99 hover:cursor-pointer ${
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
              {currentQuestion && (
                <div className="flex flex-col gap-6">
                  <h3 className="text-title5_sb_20">{currentQuestion.questionTitle}</h3>
                  <p className="text-body3_r_16 text-CoolNeutral-20 leading-relaxed whitespace-pre-line">
                    {currentQuestion.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
