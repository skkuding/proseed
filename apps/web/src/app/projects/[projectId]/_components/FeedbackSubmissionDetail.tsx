import Image from 'next/image'
import { ChevronRightIcon, Dot } from 'lucide-react'
import { AccordionContent } from '@/components/ui/accordion'
import type { SubmissionCard } from './FeedbackSubmissionCard'

interface FeedbackSubmissionDetailProps {
  card: SubmissionCard
  selectedQuestionId: number | undefined
  onSelectQuestion: (questionId: number) => void
  onImageClick: (images: string[], index: number) => void
}

export function FeedbackSubmissionDetail({
  card,
  selectedQuestionId,
  onSelectQuestion,
  onImageClick,
}: FeedbackSubmissionDetailProps) {
  const selectedQuestion =
    card.questions.find((q) => q.questionId === selectedQuestionId) ?? card.questions[0]

  return (
    <AccordionContent className="pb-0 pl-2">
      <div className="flex min-h-50 pb-10 gap-10">
        {/* Left sidebar */}
        <div className="w-[283px] h-[254px] shrink-0 p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] rounded-[8px] flex flex-col gap-3">
          <p className="text-title3_sb_24">피드백 답변 바로가기</p>
          <div className="flex flex-col">
            {card.questions.map((q) => {
              const isSelected = selectedQuestionId === q.questionId
              return (
                <button
                  key={q.questionId}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectQuestion(q.questionId)
                  }}
                  className={`flex justify-between items-center text-left w-full px-1 py-2 rounded-lg text-body1_m_16 text-CoolNeutral-20 transition-colors hover:bg-neutral-99 hover:cursor-pointer ${
                    isSelected ? 'bg-neutral-99' : ''
                  }`}
                >
                  <div className="flex items-center gap-[2px]">
                    <Dot className="size-4 shrink-0" />
                    <span className="max-w-[185px] truncate">{q.questionTitle}</span>
                  </div>
                  <ChevronRightIcon className="size-6 shrink-0 text-[#7B7B7B]" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1">
          {selectedQuestion && (
            <div className="flex flex-col gap-5">
              <h3 className="text-title3_sb_24">{selectedQuestion.questionTitle}</h3>
              <p className="text-body3_r_16 text-CoolNeutral-20 leading-relaxed whitespace-pre-line">
                {selectedQuestion.content}
              </p>
              {selectedQuestion.imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-x-2 gap-y-4 mt-5">
                  {selectedQuestion.imageUrls.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation()
                        onImageClick(selectedQuestion.imageUrls, idx)
                      }}
                      className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 hover:opacity-90 transition-opacity hover:cursor-pointer"
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AccordionContent>
  )
}
