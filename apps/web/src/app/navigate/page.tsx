'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_TO_API, type CategoryLabel } from '@/app/_utils/projectConstants'
import { getProjects, type Project } from '@/lib/api'
import CategoryTabs from '@/app/mainpage/_components/CategoryTabs'
import ProjectCard, { ProjectCardSkeleton } from '@/app/mainpage/_components/ProjectCard'
import { Button } from '@/components/ui/button'
import { NumberedPagination } from '@/components/NumberedPagination'
import { SearchModal } from './_components/SearchModal'

const PAGE_SIZE = 9

export default function Navigate() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryLabel>('전체')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const apiCategory = selectedCategory === '전체' ? undefined : CATEGORY_TO_API[selectedCategory]
    getProjects({ category: apiCategory, take: 100 })
      .then((res) => setAllProjects(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [selectedCategory])

  const totalPages = Math.ceil(allProjects.length / PAGE_SIZE)
  const paginationPages = Math.max(totalPages, 1)
  const pagedProjects = allProjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleCategorySelect = (category: CategoryLabel) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    setAllProjects([])
    setIsLoading(true)
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1200px] pt-10 flex flex-col gap-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-head0_sb_52">프로젝트 탐색하기</h1>
            <p className="text-title6_m_20 text-neutral-40">
              다양한 사이드 프로젝트를 둘러보고 피드백을 남겨보세요
            </p>
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm hover:bg-neutral-99 transition-colors hover:cursor-pointer"
            aria-label="프로젝트 검색"
          >
            <Image src="/search.svg" alt="검색" width={32} height={32} />
          </button>
        </div>

        {/* Category tabs */}
        <CategoryTabs selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />

        {/* Project grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-x-2 gap-y-5">
            {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <ProjectCardSkeleton key={idx} />
            ))}
          </div>
        ) : pagedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="flex flex-col items-center gap-2">
              <p className="text-title3_sb_24">등록된 프로젝트가 없습니다</p>
              <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
                <p>새로운 프로젝트를 등록하고</p>
                <p>성장의 첫걸음을 시작해 보세요.</p>
              </div>
            </div>
            <Button asChild size="lg" className="text-sub3_sb_16">
              <Link href="/projects/new/register">프로젝트 등록하기</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-2 gap-y-5">
            {pagedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <NumberedPagination
          currentPage={currentPage}
          totalPages={paginationPages}
          onPageChange={handlePageChange}
          className="mt-10"
        />
      </div>

      <SearchModal
        key={String(isSearchOpen)}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </main>
  )
}
