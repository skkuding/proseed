import Image from 'next/image'
import { ChevronDownIcon } from 'lucide-react'
import { AccordionTrigger } from '@/components/ui/accordion'
import { JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'
import type { SubmissionCard } from './FeedbackSubmissionCard'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`
}

interface FeedbackSubmissionPreviewProps {
  card: SubmissionCard
  isOpen: boolean
}

export function FeedbackSubmissionPreview({ card, isOpen }: FeedbackSubmissionPreviewProps) {
  const roleLabel =
    (card.author.role && JOB_API_TO_LABEL[card.author.role]) ?? card.author.role ?? ''

  return (
    <div className="flex flex-col gap-7 py-10">
      <AccordionTrigger className="[&>svg]:hidden items-center cursor-pointer pl-2">
        <div className="flex items-center gap-3 w-full">
          <div className="relative w-[67px] h-[69px] rounded-full overflow-hidden shrink-0 bg-neutral-100">
            <Image
              src={card.author.profileImageUrl}
              alt={card.author.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-body2_m_14 text-primary-strong">{roleLabel}</span>
            <span className="text-title1_sb_28">{card.author.name}</span>
            <span className="text-body1_m_16 text-[#6E6E6E]">{formatDate(card.createdAt)}</span>
          </div>
          <ChevronDownIcon
            className={`ml-auto size-10 shrink-0 text-CoolNeutral-20 transition-transform ${
              isOpen ? 'scale-y-[-1]' : ''
            }`}
          />
        </div>
      </AccordionTrigger>

      {/* Always visible: one-line review */}
      <div
        className={`bg-[#0000000A] border border-[#00000033] rounded-[12px] px-6 py-5 ml-2 ${isOpen ? '' : 'h-[66px]'}`}
      >
        <p className={`text-title4_m_20 leading-[130%] ${isOpen ? '' : 'truncate'}`}>
          {card.oneLineReview}
        </p>
      </div>
    </div>
  )
}
