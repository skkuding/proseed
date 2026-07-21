import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_LABELS } from '@/app/_utils/projectConstants'

interface GrowthRecordCardProps {
  projectId: number
  projectName: string
  projectIconUrl: string
  title: string
  updateGoal: string
  projectCategories: string[]
  releasedAt: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`
}

export default function GrowthRecordCard({
  projectId,
  projectName,
  projectIconUrl,
  title,
  updateGoal,
  projectCategories,
  releasedAt,
}: GrowthRecordCardProps) {
  return (
    <Link href={`/projects/${projectId}`} className="block">
      <article className="flex h-[198px] w-full cursor-pointer gap-5 rounded-[12px] bg-white p-6 shadow-[0_4px_12px_0_rgba(27,29,38,0.06)] transition-colors hover:bg-CoolNeutral-90">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-gray-200">
          <Image src={projectIconUrl} alt={projectName} fill className="object-cover" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-[6px] border-b border-CoolNeutral-95">
            <div className="flex flex-wrap items-center gap-[6px]">
              <h3 className="text-title3_sb_24 text-black">{title}</h3>

              {projectCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center rounded-[4px] bg-neutral-99 px-2 py-1 text-body1_m_16 text-CoolNeutral-40"
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
              ))}
            </div>

            <p className="min-h-12 line-clamp-2 overflow-hidden mb-5 text-body3_r_16 text-CoolNeutral-20">
              {updateGoal}
            </p>
          </div>

          <div className="flex items-center gap-1 pt-3">
            <span className="text-body1_m_16 text-CoolNeutral-15">{projectName}</span>

            <span className="flex h-4 w-4 items-center justify-center">
              <span className="h-[6px] w-[6px] rounded-full bg-CoolNeutral-40" />
            </span>

            <span className="text-body3_r_16 text-CoolNeutral-40">{formatDate(releasedAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
