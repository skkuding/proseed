'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import mockProjects from '@/app/_mockdata/project-list/recent-projects.json'
import CategoryTabs, { CategoryLabel } from './CategoryTabs'
import ProjectCard from './ProjectCard'
import SectionTitle from './SectionTitle'

type Project = {
  id: number
  title: string
  type: string
  status: string
  oneLineDescription: string
  category: Exclude<CategoryLabel, '전체'>[]
  thumbnailUrl: string
}

export default function RecentProjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryLabel>('전체')

  const filteredProjects = useMemo(() => {
    const projects = mockProjects as Project[]

    if (selectedCategory === '전체') {
      return projects
    }

    return projects.filter((project) => project.category.includes(selectedCategory))
  }, [selectedCategory])

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionTitle title="최근 업로드 된 프로젝트" />
        <Link href="/navigate">
          <button type="button" className="flex items-center text-title6_m_20 cursor-pointer">
            전체 보기
            <Image src="/arrow2_right.svg" alt="다음" width={24} height={24} />
          </button>
        </Link>
      </div>

      <div className="flex flex-col gap-7">
        <CategoryTabs selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
