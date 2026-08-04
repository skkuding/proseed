'use client'

import Image from 'next/image'
import { LockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FeedbackListItemDto } from '@/lib/api'

export type SubmissionQuestion = {
  questionId: number
  questionTitle: string
  questionContent: string
  content: string
  imageUrls: string[]
}

export type SubmissionCard = {
  submissionId: number
  userId: number
  isAdopted: boolean
  // 같은 제출·같은 직군 안에서는 항상 동일한 값(직군 단위 unlock)이라 카드 하나당 하나로 취급한다
  isUnlocked: boolean
  author: { name: string; profileImageUrl: string }
  oneLineReview: string
  questions: SubmissionQuestion[]
}

export function buildSubmissionCards(items: FeedbackListItemDto[]): SubmissionCard[] {
  const bySubmission = new Map<number, SubmissionCard>()
  for (const item of items) {
    const card = bySubmission.get(item.submissionId) ?? {
      submissionId: item.submissionId,
      userId: item.userId,
      isAdopted: item.isAdopted,
      isUnlocked: item.isUnlocked,
      author: { name: item.author.name, profileImageUrl: item.author.profileImageUrl },
      oneLineReview: item.oneLineReview,
      questions: [],
    }
    card.questions.push({
      questionId: item.questionId,
      questionTitle: item.questionTitle,
      questionContent: item.questionContent,
      content: item.content,
      imageUrls: item.imageUrls,
    })
    bySubmission.set(item.submissionId, card)
  }
  return [...bySubmission.values()]
}

interface FeedbackTagCardProps {
  card: SubmissionCard
  activeTabLabel: string
  isSelected: boolean
  disabled: boolean
  onToggle: () => void
  onOpenDetail: () => void
}

export function FeedbackTagCard({
  card,
  activeTabLabel,
  isSelected,
  disabled,
  onToggle,
  onOpenDetail,
}: FeedbackTagCardProps) {
  return (
    <div
      onClick={() => {
        if (disabled) return
        onToggle()
      }}
      className={`rounded-[12px] border p-5 flex flex-col gap-4 transition-colors ${disabled ? '' : 'hover:cursor-pointer'} ${
        isSelected
          ? 'border-primary-strong bg-white'
          : disabled
            ? 'border-none bg-neutral-99 opacity-60'
            : 'border-none bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-10">
        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="relative w-15 h-15 rounded-full overflow-hidden shrink-0">
            <Image
              src={card.author.profileImageUrl}
              alt={card.author.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-body2_m_14 text-primary-strong">{activeTabLabel}</span>
            <span className="flex items-center gap-1 text-title5_sb_20 leading-tight">
              {card.author.name}
              {/* 디자인 확정 전 임시 표시 — 티켓으로 열람하지 않은 피드백 */}
              {!card.isUnlocked && (
                <LockIcon className="size-4 shrink-0 text-CoolNeutral-50" aria-label="잠김" />
              )}
            </span>
          </div>
        </div>

        {/* Checkbox */}
        <div
          className={`size-8 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected ? 'bg-primary-strong border-primary-strong' : 'border-neutral-300 bg-white'
          }`}
        >
          {isSelected && (
            <svg
              viewBox="0 0 12 10"
              className="size-4 text-white fill-none stroke-current stroke-2"
            >
              <polyline points="1,5 4.5,8.5 11,1" />
            </svg>
          )}
        </div>
      </div>

      {/* One-line review */}
      <Button
        variant="iconMuted"
        size="bare"
        onClick={(e) => {
          e.stopPropagation()
          onOpenDetail()
        }}
        className="w-full text-left text-black"
      >
        <div className="rounded-[12px] border border-[#00000033] bg-[#0000000A] px-4 py-3 w-full">
          <p className="text-body1_m_16 truncate">{card.oneLineReview}</p>
        </div>
      </Button>
    </div>
  )
}
