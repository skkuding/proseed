import Image from 'next/image'
import Link from 'next/link'

interface MyProjectCardProps {
  project: {
    id: number
    title: string
    oneLineDescription: string
    category: string[]
    thumbnailUrl: string
    feedbackCount: number
    growthRecordCount: number
  }
}

export default function MyProjectCard({ project }: MyProjectCardProps) {
  return (
    <article className="h-[500px] w-full px-2 overflow-hidden rounded-[20px] bg-white shadow-sm flex flex-col pt-2 pb-6 transition-transform duration-300 ease-in-out hover:scale-[1.03]">
      <Link href={`/projects/${project.id}`} className="block flex-1 min-h-0">
        <div className="flex h-full flex-col">
          <div className="relative mb-4 h-[245px] w-full shrink-0 overflow-hidden rounded-[20px] bg-gray-200">
            <Image src={project.thumbnailUrl} alt={project.title} fill className="object-cover" />
          </div>

          <div className="flex flex-col px-2 gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <h3 className="text-title3_sb_24 truncate">{project.title}</h3>
                <div className="flex shrink-0 items-center gap-1">
                  {project.category.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center rounded-[4px] bg-neutral-99 px-2 py-1 text-body1_m_16 text-CoolNeutral-40"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <p className="line-clamp-2 text-body3_r_16 text-CoolNeutral-30">
                {project.oneLineDescription}
              </p>
            </div>

            <div className="flex w-fit items-center gap-4">
              <div className="inline-flex items-center gap-[6px]">
                <Image src="/chat_fill.svg" alt="피드백" width={20} height={20} />
                <span className="text-body1_m_16 text-CoolNeutral-30">
                  피드백 {project.feedbackCount}
                </span>
              </div>
              <div className="inline-flex items-center gap-[6px]">
                <Image src="/plant.svg" alt="성장과정" width={20} height={20} />
                <span className="text-body1_m_16 text-CoolNeutral-30">
                  성장기록 {project.growthRecordCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex gap-2 px-2 pt-3">
        <Link
          href={`/projects/${project.id}/editmyproject`}
          className="flex-1 flex items-center justify-center px-5 py-[15px] h-13 rounded-[8px] border-[1.4px] border-CoolNeutral-50 text-sub3_sb_16 text-CoolNeutral-20 hover:bg-neutral-99 transition-colors"
        >
          편집하기
        </Link>
        <Link
          href={`/projects/${project.id}/growthrecord/create`}
          className="flex-1 flex h-13 items-center px-5 py-[15px] justify-center rounded-[8px] bg-CoolNeutral-20 text-sub3_sb_16 text-white hover:bg-CoolNeutral-30 transition-colors"
        >
          성장기록 작성하기
        </Link>
      </div>
    </article>
  )
}
