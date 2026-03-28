'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import navigateProjects from '@/app/_mockdata/project-list/navigate-projects.json'
import CategoryTabs, { CategoryLabel } from '@/app/mainpage/_components/CategoryTabs'
import ProjectCard from '@/app/mainpage/_components/ProjectCard'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { SearchModal } from './_components/SearchModal'

const PAGE_SIZE = 9

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const delta = 2
  const rangePages: number[] = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      rangePages.push(i)
    }
  }

  const result: (number | 'ellipsis')[] = []
  let prev = 0
  for (const page of rangePages) {
    if (prev && page - prev > 1) result.push('ellipsis')
    result.push(page)
    prev = page
  }
  return result
}

export default function Navigate() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryLabel>('전체')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const filteredProjects = useMemo(() => {
    if (selectedCategory === '전체') return navigateProjects
    return navigateProjects.filter((p) => p.category.includes(selectedCategory))
  }, [selectedCategory])

  const totalPages = Math.ceil(filteredProjects.length / PAGE_SIZE)
  const pagedProjects = filteredProjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleCategorySelect = (category: CategoryLabel) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1200px] px-6 py-14 flex flex-col gap-10">
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
            <Image src="/search.svg" alt="검색" width={24} height={24} />
          </button>
        </div>

        {/* Category tabs */}
        <CategoryTabs selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />

        {/* Project grid */}
        {pagedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-CoolNeutral-50">
            <Image src="/info.svg" alt="정보" width={24} height={24} />
            <p className="text-body3_r_16">해당 카테고리의 프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-2 gap-y-5">
            {pagedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(currentPage - 1)
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-40' : ''}
                />
              </PaginationItem>

              {getVisiblePages(currentPage, totalPages).map((page, idx) =>
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(page)
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-40' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  )
}
