import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/api'
import { ProjectImageCarousel } from '../_components/ProjectImageCarousel'
import { ProjectMember } from '../_components/ProjectMember'
import { ProjectDescription } from '../_components/ProjectDescription'
import ProjectTabs from '../_components/ProjectTabs'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}

export default async function ProjectDetailLayout({ children, params }: LayoutProps) {
  const { projectId } = await params

  const project = await getProjectById(projectId).catch((error) => {
    console.error('Failed to fetch project:', error)
    return null
  })

  // 없는 프로젝트는 200 + 안내 UI(soft 404) 대신 실제 404 를 반환해 색인되지 않게 한다.
  if (!project) {
    notFound()
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
