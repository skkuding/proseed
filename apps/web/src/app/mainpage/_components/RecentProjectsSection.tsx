'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CATEGORY_TO_API, type CategoryLabel } from '@/app/_utils/projectConstants'
import { getProjects, type Project } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import CategoryTabs from './CategoryTabs'
import ProjectCard, { ProjectCardSkeleton } from './ProjectCard'
import SectionTitle from './SectionTitle'

export default function RecentProjectsSection() {
  const [category, setCategory] = useState<CategoryLabel>('전체')
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const apiCategory = category === '전체' ? undefined : CATEGORY_TO_API[category]
    getProjects({ category: apiCategory, take: 6 })
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [category])

  const handleCategorySelect = (next: CategoryLabel) => {
    setCategory(next)
    setIsLoading(true)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionTitle title="최근 업로드 된 프로젝트" />
        <Link href="/navigate">
          <button type="button" className="flex items-center text-title6_m_20 cursor-pointer">
            전체 보기
            <Image src="/arrow2_right_grey.svg" alt="다음" width={24} height={24} />
          </button>
        </Link>
      </div>

      <div className="flex flex-col gap-7">
        <CategoryTabs selectedCategory={category} onSelectCategory={handleCategorySelect} />
        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ProjectCardSkeleton key={idx} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-15 gap-6">
            <p className="text-title3_sb_24">아직 등록된 프로젝트가 없어요</p>
            <Button asChild size="lg" className="text-sub3_sb_16">
              <Link
                href="/projects/new/register"
                onClick={() => trackEvent('cta_clicked', { location: 'recent_projects' })}
              >
                프로젝트 등록하기
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
