import Image from 'next/image'
import Link from 'next/link'

const CATEGORY_LABEL: Record<string, string> = {
  plan: '기획자',
  design: '디자이너',
  dev: '개발자',
  general: '기타',
}

interface FeedbackCardProps {
  feedbackId: number
  nickname: string
  profileImageUrl: string
  category: string
  onelineReview: string
  content: string
  projectId: number
  projectName: string
  projectIconUrl: string
}

export default function FeedbackCard({
  feedbackId,
  nickname,
  profileImageUrl,
  category,
  onelineReview,
  content,
  projectId,
  projectName,
  projectIconUrl,
}: FeedbackCardProps) {
  return (
    <article className="h-[362px] w-[536px] group flex flex-col gap-6 rounded-[16px] bg-white p-7 transition-colors hover:bg-CoolNeutral-15 shadow-[0 4px 20px 0 rgba(27, 29, 38, 0.08)]">
      {/* 유저 정보 */}
      <div className="flex items-center gap-4">
        <div className="relative overflow-hidden rounded-full">
          <Image src={profileImageUrl} alt={nickname} height={40} width={40} />
        </div>
        <div className="flex flex-col">
          <span className="text-title5_sb_20 text-CoolNeutral-20 transition-colors group-hover:text-white">
            {nickname}
          </span>
          <span className="text-body1_m_16 text-CoolNeutral-50 transition-colors group-hover:text-CoolNeutral-60">
            {CATEGORY_LABEL[category] ?? category}
          </span>
        </div>
      </div>

      {/* 피드백 내용 */}
      <div className="flex flex-col gap-3">
        <p className="line-clamp-2 text-title3_sb_24 text-CoolNeutral-20 transition-colors group-hover:text-white">
          {onelineReview}
        </p>
        <p className="line-clamp-2 text-body3_r_16 text-CoolNeutral-40 transition-colors group-hover:text-color-CoolNeutral-80">
          {content}
        </p>
      </div>

      {/* 하단: 프로젝트 + 버튼 */}
      <div className="flex items-center justify-between border-t border-neutral-95 pt-5 transition-colors group-hover:border-color-neutral-30">
        <div className="flex items-center gap-2">
          <div className="relative overflow-hidden rounded-full">
            <Image src={projectIconUrl} alt={projectName} height={28} width={28} />
          </div>
          <span className="text-title6_m_20 text-CoolNeutral-20 transition-colors group-hover:text-white">
            {projectName}
          </span>
        </div>
        <Link
          href={`/projects/${projectId}/feedback#feedback-${feedbackId}`}
          className="rounded-[6px] bg-CoolNeutral-20 px-4 py-2 text-body1_m_16 text-white transition-colors group-hover:bg-white group-hover:text-CoolNeutral-20"
        >
          피드백 자세히 보기
        </Link>
      </div>
    </article>
  )
}
