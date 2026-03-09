import CategoryTabs from './CategoryTabs'
import ProjectCard from './ProjectCard'
import SectionTitle from './SectionTitle'

export default function RecentProjectsSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionTitle title="최근 업로드 된 프로젝트" actionLabel="전체 보기" />

      <CategoryTabs />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
      </div>
    </section>
  )
}
