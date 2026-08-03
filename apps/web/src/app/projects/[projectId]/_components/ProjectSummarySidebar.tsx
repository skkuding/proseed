import { Dot } from 'lucide-react'
import { CATEGORY_LABELS } from '@/app/_utils/projectConstants'
import type { ProjectDetailResponseDto } from '@/lib/api'

interface ProjectSummarySidebarProps {
  project: ProjectDetailResponseDto | null
}

export function ProjectSummarySidebar({ project }: ProjectSummarySidebarProps) {
  return (
    <>
      <p className="text-title1_sb_28">프로젝트 요약</p>
      {project && (
        <ul className="flex flex-col gap-2 list-none">
          <li className="flex items-start gap-0.5 min-w-0">
            <Dot className="size-6 shrink-0 text-CoolNeutral-20" />
            <span className="truncate text-body1_m_16 text-CoolNeutral-20">{project.title}</span>
          </li>
          <li className="flex items-start gap-0.5 min-w-0">
            <Dot className="size-6 shrink-0 text-CoolNeutral-20" />
            <span className="truncate text-body1_m_16 text-CoolNeutral-20">
              {project.category.map((c) => CATEGORY_LABELS[c] ?? c).join(', ')}
            </span>
          </li>
          <li className="flex items-start gap-0.5 min-w-0">
            <Dot className="size-6 shrink-0 text-CoolNeutral-20" />
            <span className="truncate text-body1_m_16 text-CoolNeutral-20">
              {project.oneLineDescription}
            </span>
          </li>
        </ul>
      )}
    </>
  )
}
