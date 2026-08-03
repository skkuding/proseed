import { Dot, ChevronRightIcon } from 'lucide-react'
import type { FeedbackQuestionItemDto } from '@/lib/api'

interface FeedbackAnswerNavSidebarProps {
  questions: FeedbackQuestionItemDto[]
  onScrollTo: (questionId: number) => void
}

export function FeedbackAnswerNavSidebar({ questions, onScrollTo }: FeedbackAnswerNavSidebarProps) {
  return (
    <>
      <p className="text-title1_sb_28">피드백 답변 바로가기</p>
      <div className="flex flex-col gap-3">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => onScrollTo(q.id)}
            className="flex items-center justify-between w-full rounded-lg text-body2_m_14 text-CoolNeutral-20 hover:bg-neutral-99 hover:cursor-pointer transition-colors text-left"
          >
            <div className="flex items-center gap-0.5 min-w-0">
              <Dot className="size-6 shrink-0 text-CoolNeutral-20" />
              <span className="truncate text-body1_m_16">{q.title}</span>
            </div>
            <ChevronRightIcon className="size-5 shrink-0 text-CoolNeutral-40" />
          </button>
        ))}
      </div>
    </>
  )
}
