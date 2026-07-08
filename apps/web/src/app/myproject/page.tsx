'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import CategoryTabs from '@/app/mainpage/_components/CategoryTabs'
import { CATEGORY_TO_API, type CategoryLabel } from '@/app/_utils/projectConstants'
import MyProjectCard from './_components/MyProjectCard'
import ProjectCard from '@/app/mainpage/_components/ProjectCard'
import { getMyProjects } from '@/lib/api'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import navigateProjects from '@/app/_mockdata/project-list/navigate-projects.json'

const PAGE_SIZE = 9

type Project = {
  id: number
  title: string
  oneLineDescription: string
  category: string[]
  thumbnailUrl: string
  feedbackCount: number
  growthRecordCount: number
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const rangePages: number[] = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) rangePages.push(i)
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

export default function MyProject() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<CategoryLabel>('전체')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    getMyProjects()
      .then((data) =>
        setProjects(
          data.map((p) => ({
            ...p,
            growthRecordCount: p._count?.versions ?? 0,
          }))
        )
      )
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const filteredProjects = useMemo(
    () =>
      selectedCategory === '전체'
        ? projects
        : projects.filter((p) => p.category.includes(CATEGORY_TO_API[selectedCategory])),
    [projects, selectedCategory]
  )

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

  const isEmpty = !isLoading && projects.length === 0

  return (
    <main className="min-h-screen pt-10 ">
      <div className="mx-auto max-w-[1200px] flex flex-col gap-10">
        <div className="flex flex-col gap-7">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-head0_sb_52">내 프로젝트</h1>
              <p className="text-title6_m_20 text-neutral-40">
                프로젝트를 업로드하여 다양한 피드백을 받고 성장하세요
              </p>
            </div>
            <Link
              href="/projects/new/register"
              className="inline-flex items-center justify-center h-13 px-5 py-[15px] rounded-[8px] bg-CoolNeutral-20 text-white text-sub3_sb_16 hover:bg-CoolNeutral-30 transition-colors"
            >
              프로젝트 등록하기
            </Link>
          </div>
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
        <div>
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-30 gap-2">
              <p className="text-title3_sb_24 text-black">아직 등록된 내 프로젝트가 없어요</p>
              <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
                <p>프로젝트를 등록하여 피드백을 받고</p>
                <p>성장기록을 작성하며 커리어 성장을 이뤄보세요</p>
              </div>

              <Link
                href="/projects/new/register"
                className="mt-4 inline-flex items-center justify-center h-13 px-5 py-[15px] rounded-[8px] bg-CoolNeutral-20 text-white text-sub3_sb_16 hover:bg-CoolNeutral-30 transition-colors"
              >
                프로젝트 등록하기
              </Link>
            </div>
          )}
          {projects.length > 0 && (
            <div className="flex flex-col gap-10">
              {pagedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-30 text-body3_r_16 text-CoolNeutral-40">
                  해당 카테고리의 프로젝트가 없습니다.
                  <Link
                    href="/projects/new/register"
                    className="mt-4 inline-flex items-center justify-center h-13 px-5 py-[15px] rounded-[8px] bg-CoolNeutral-20 text-white text-sub3_sb_16 hover:bg-CoolNeutral-30 transition-colors"
                  >
                    프로젝트 등록하기
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-x-2 gap-y-5">
                  {pagedProjects.map((project) => (
                    <MyProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
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
                        <PaginationItem key={`e-${idx}`}>
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
                        className={
                          currentPage === totalPages ? 'pointer-events-none opacity-40' : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>

        {pagedProjects.length <= 6 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-title3_sb_24">추천 프로젝트</h2>
            <div className="grid grid-cols-3 gap-x-2 gap-y-5">
              {navigateProjects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
