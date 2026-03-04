import { mockProject } from '@/app/_mockdata/project-detail/project-basicdata.json'
import { ProjectImageCarousel } from './_components/ProjectImageCarousel'
import { ProjectMember } from './_components/ProjectMember'
import { ProjectDescription } from './_components/ProjectDescription'
import ProjectTabs from './_components/ProjectTabs'

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full mt-5">
      {/* 이미지 영역 */}
      <ProjectImageCarousel
        images={[mockProject.thumbnailUrl, ...mockProject.images.map((i) => i.url)]}
      />
      {/* 본문 */}
      <section className="mt-5 flex flex-col gap-6">
        <div className="flex justify-between gap-4">
          {/* 왼쪽 */}
          <ProjectDescription />
          {/* 오른쪽 - 함께한 팀원 */}
          <ProjectMember />
        </div>
      </section>
      <div className="flex flex-col bg-white w-full px-8 py-7 rounded-xl mt-6 mb-30">
        <ProjectTabs />
        {children}
      </div>
    </div>
  )
}
