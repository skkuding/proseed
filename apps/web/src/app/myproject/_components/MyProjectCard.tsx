import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABELS } from '@/app/_utils/projectConstants'

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
    <article className="w-full px-2 overflow-hidden rounded-[20px] bg-white shadow-sm flex flex-col pt-2 pb-6 transition-transform duration-300 ease-in-out hover:scale-[1.03]">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-[20px] bg-gray-200">
        <Image src={project.thumbnailUrl} alt={project.title} fill className="object-cover" />
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-6 pt-4 px-2">
        <Link href={`/projects/${project.id}`} className="block">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <h3 className="text-title3_sb_24 truncate">{project.title}</h3>
                <div className="flex shrink-0 items-center gap-1">
                  {project.category.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center rounded-[4px] bg-neutral-99 px-2 py-1 text-body1_m_16 text-CoolNeutral-40"
                    >
                      {CATEGORY_LABELS[cat] ?? cat}
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
        </Link>

        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-0 flex-1 truncate text-sub3_sb_16"
          >
            <Link href={`/projects/${project.id}/editmyproject`}>편집하기</Link>
          </Button>
          <Button asChild size="lg" className="min-w-0 flex-1 truncate text-sub3_sb_16">
            <Link href={`/projects/${project.id}/growthrecord/create`}>성장기록 작성하기</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
