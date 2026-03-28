import Image from 'next/image'
import Link from 'next/link'

interface GrowthRecordCardProps {
  projectId: number
  projectName: string
  projectIconUrl: string
  versionTitle: string
  updateGoal: string
  projectCategories: string[]
  createdAt: string
}

export default function GrowthRecordCard({
  projectId,
  projectName,
  projectIconUrl,
  versionTitle,
  updateGoal,
  projectCategories,
  createdAt,
}: GrowthRecordCardProps) {
  return (
    <Link href={`/projects/${projectId}`}>
      <article className="h-[198px] w-full rounded-[12px] bg-white p-6 cursor-pointer shadow-[0_4px_12px_0_rgba(27,29,38,0.06)] transition-colors hover:bg-CoolNeutral-90 flex gap-5">
        {/* div1: 아이콘 */}
        <div className="relative h-16 shrink-0 overflow-hidden rounded-[12px] bg-gray-200">
          <Image src={projectIconUrl} alt={projectName} height={64} width={64} />
        </div>

        {/* div2 + div3 + div4 */}
        <div className="flex flex-col">
          {/* div2: 제목 + 카테고리 뱃지 */}
          <div className="flex items-center gap-[6px] flex-wrap pb-[6px]">
            <h3 className="text-title3_sb_24 text-black">{versionTitle}</h3>
            {projectCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center rounded-[4px] bg-neutral-99 px-2 py-1 text-body1_m_16 text-CoolNeutral-40"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* div3: 본문 */}
          <p className="line-clamp-2 overflow-hidden text-body3_r_16 text-CoolNeutral-20 mb-5">
            {updateGoal}
          </p>

          {/* div4: 프로젝트명 + 날짜 */}
          <div className="flex items-center gap-1 border-t border-CoolNeutral-95 pt-3">
            <span className="text-body1_m_16 text-CoolNeutral-15">{projectName}</span>
            <span className="flex h-4 w-4 items-center justify-center">
              <span className="h-[6px] w-[6px] rounded-full bg-CoolNeutral-40" />
            </span>
            <span className="text-body3_r_16 text-CoolNeutral-40">{createdAt}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
