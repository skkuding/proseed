import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FieldBadge } from '@/components/FieldBadge'
import { formatDate } from '@/lib/utils'

interface MyFeedbackCardProps {
  feedbackId: number
  versionId: number
  createdAt: string
  isAdopted: boolean
  oneLineDescription: string
  projectId: number
  projectName: string
  projectIconUrl: string
}

export function MyFeedbackCard({
  feedbackId,
  versionId,
  createdAt,
  isAdopted,
  oneLineDescription,
  projectId,
  projectName,
  projectIconUrl,
}: MyFeedbackCardProps) {
  return (
    <div className="flex gap-5 justify-between rounded-[16px] bg-white px-6 py-5 shadow-[0_4px_20px_0_rgba(27,29,38,0.08)]">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-[6px]">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-[#F5F6F8]">
              <Image src={projectIconUrl} alt={projectName} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-sub3_sb_16 text-neutral-20 line-clamp-1">{projectName}</p>
            </div>
          </div>
          {isAdopted && <FieldBadge type="채택됨" />}
        </div>
        <p className="text-title5_sb_20 text-CoolNeutral-20 line-clamp-2">{oneLineDescription}</p>

        <span className="text-caption1_m_14 text-neutral-40">{formatDate(createdAt)}</span>
      </div>

      <div className="flex items-center justify-center">
        <Button asChild size="md" className="text-sub3_sb_16">
          <Link
            href={`/projects/${projectId}/feedback?version=${versionId}#feedback-${feedbackId}`}
          >
            자세히 보기
          </Link>
        </Button>
      </div>
    </div>
  )
}
