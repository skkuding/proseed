import Image from 'next/image'
import Link from 'next/link'

interface MyFeedbackCardProps {
  feedbackId: number
  createdAt: string
  isAdopted: boolean
  onelineReview: string
  content: string
  projectId: number
  projectName: string
  projectIconUrl: string
}

export function MyFeedbackCard({
  feedbackId,
  createdAt,
  isAdopted,
  onelineReview,
  content,
  projectId,
  projectName,
  projectIconUrl,
}: MyFeedbackCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-95 p-6">
      <div className="flex items-center justify-between">
        <span className="text-body3_r_16 text-neutral-50">{createdAt}</span>
        {isAdopted && (
          <span className="rounded-full bg-primary-light px-3 py-1 text-caption1_m_16 text-primary-strong">
            채택됨
          </span>
        )}
      </div>
      <div>
        <p className="text-title5_sb_22 text-neutral-10 line-clamp-1">{onelineReview}</p>
        <p className="mt-2 text-body3_r_16 text-neutral-40 line-clamp-2">{content}</p>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-95 pt-4">
        <div className="flex items-center gap-2">
          <Image
            src={projectIconUrl}
            alt={projectName}
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="text-body1_m_16 text-neutral-20">{projectName}</span>
        </div>
        <Link
          href={`/projects/${projectId}/feedback#feedback-${feedbackId}`}
          className="inline-flex items-center justify-center rounded-[8px] border border-neutral-90 px-4 py-2 text-body1_m_16 text-neutral-20 hover:bg-neutral-99 transition-colors"
        >
          피드백 자세히 보기
        </Link>
      </div>
    </div>
  )
}
