'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProjectById, type ProjectDetailResponseDto } from '@/lib/api'
import { ProjectImageCarousel } from '../_components/ProjectImageCarousel'
import { ProjectMember } from '../_components/ProjectMember'
import { ProjectDescription } from '../_components/ProjectDescription'
import ProjectTabs from '../_components/ProjectTabs'

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<ProjectDetailResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getProjectById(projectId)
      .then(setProject)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [projectId])

  if (isLoading) return null

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-30 text-body3_r_16 text-CoolNeutral-40">
        프로젝트를 찾을 수 없습니다.
      </div>
    )
  }

  const sortedImages = [...project.images].sort((a, b) => a.order - b.order)

  return (
    <div className="w-full mt-5 px-1">
      {/* 이미지 영역 */}
      <ProjectImageCarousel images={[project.thumbnailUrl, ...sortedImages.map((i) => i.url)]} />
      {/* 본문 */}
      <section className="mt-5 flex flex-col gap-6">
        <div className="flex justify-between gap-4">
          {/* 왼쪽 */}
          <ProjectDescription project={project} />
          {/* 오른쪽 - 함께한 팀원 */}
          <ProjectMember members={project.projectRoles} />
        </div>
      </section>
      <div className="flex flex-col bg-white w-full px-8 py-7 rounded-xl mt-6 mb-30">
        <ProjectTabs />
        {children}
      </div>
    </div>
  )
}
