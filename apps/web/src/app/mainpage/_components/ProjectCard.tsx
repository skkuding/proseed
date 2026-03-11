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
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <article className="cursor-pointer overflow-hidden rounded-[20px] bg-white p-3 shadow-sm">
        <div className="relative mb-4 h-[180px] w-full overflow-hidden rounded-[16px] bg-gray-200">
          <Image src={project.thumbnailUrl} alt={project.title} fill className="object-cover" />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-black">{project.title}</h3>
          <span className="text-sm text-gray-400">{project.category.join(', ')}</span>
          <p className="text-sm leading-6 text-gray-500">{project.oneLineDescription}</p>
        </div>
      </article>
    </Link>
  )
}
