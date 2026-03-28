import Image from 'next/image'
import Link from 'next/link'

interface ProjectCardProps {
  project: {
    id: number
    title: string
    type: string
    status: string
    oneLineDescription: string
    category: string[]
    thumbnailUrl: string
    feedbackCount: number
    growthRecordCount: number
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="block">
      <article className="h-[382px] w-full cursor-pointer overflow-hidden rounded-[20px] bg-white shadow-sm px-2 transition-transform duration-300 ease-in-out hover:scale-[1.03]">
        <div className="flex h-full flex-col pt-2 pb-6">
          <div className="relative mb-3 h-[245px] w-full shrink-0 overflow-hidden rounded-[16px] bg-gray-200">
            <Image src={project.thumbnailUrl} alt={project.title} fill className="object-cover" />
          </div>

          <div className="flex flex-col px-2 gap-5">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <h3 className="text-title3_sb_24 truncate">{project.title}</h3>
                <div className="flex shrink-0 items-center gap-1">
                  {project.category.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center rounded-[4px] bg-neutral-99 px-2 py-1 text-body1_m_16 text-CoolNeutral-40"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <p className="line-clamp-1 text-body3_r_16 text-CoolNeutral-30">
                {project.oneLineDescription}
              </p>
            </div>

            <div className="flex w-fit items-center gap-4">
              <div className="inline-flex items-center gap-1">
                <Image src="/chat_fill.svg" alt="피드백" width={20} height={20} />
                <span className="text-body1_m_16 text-CoolNeutral-30">
                  피드백 {project.feedbackCount}
                </span>
              </div>

              <div className="inline-flex items-center gap-1">
                <Image src="/plant.svg" alt="성장과정" width={20} height={20} />
                <span className="text-body1_m_16 text-CoolNeutral-30">
                  성장기록 {project.growthRecordCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
