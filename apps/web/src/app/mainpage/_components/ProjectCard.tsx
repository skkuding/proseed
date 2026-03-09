interface ProjectCardProps {
  title?: string
  category?: string
  summary?: string
}

export default function ProjectCard({
  title = '프로젝트 제목',
  category = '웹·서비스',
  summary = '프로젝트 설명이 들어갈 자리입니다.',
}: ProjectCardProps) {
  return (
    <article className="overflow-hidden rounded-[20px] bg-white p-3 shadow-sm">
      <div className="mb-4 h-[180px] w-full rounded-[16px] bg-gray-200" />

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <span className="text-sm text-gray-400">{category}</span>
        <p className="text-sm leading-6 text-gray-500">{summary}</p>
      </div>
    </article>
  )
}
