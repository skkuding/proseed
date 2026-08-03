'use client'

import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getProjects, type Project } from '@/lib/api'
import ProjectCard, { ProjectCardSkeleton } from '@/app/mainpage/_components/ProjectCard'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { SearchModal } from '@/app/navigate/_components/SearchModal'

const PAGE_SIZE = 9

function getVisiblePages(total: number): number[] {
  return Array.from({ length: total }, (_, i) => i + 1)
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  // query가 바뀔 때마다 완전히 리마운트시켜 currentPage/results/isLoading을
  // 초기값으로 되돌린다 (effect 안에서 setState를 직접 호출하지 않기 위함).
  return <SearchResults key={query} query={query} />
}

function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(() => Boolean(query))
  const [currentPage, setCurrentPage] = useState(1)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    if (!query) return
    getProjects({ search: query, take: 100 })
      .then((res) => setResults(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [query])

  const totalPages = Math.ceil(results.length / PAGE_SIZE)
  const paginationPages = Math.max(totalPages, 1)
  const pagedResults = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1200px] pt-10 flex flex-col gap-10">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-head0_sb_52">검색 결과를 확인해보세요</h1>
            <p className="text-title6_m_20 text-CoolNeutral-40">
              총 <span className="text-primary-strong text-title5_sb_20">{results.length}개</span>의
              검색 결과를 찾았습니다.
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

        {isLoading ? (
          <div className="grid grid-cols-3 gap-x-2 gap-y-5">
            {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <ProjectCardSkeleton key={idx} />
            ))}
          </div>
        ) : pagedResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="flex flex-col items-center gap-2">
              <p className="text-title3_sb_24">찾으시는 검색 결과가 없습니다</p>
              <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
                <p>일치하는 검색 결과를 찾지 못했습니다.</p>
                <p>검색어를 다시 확인하거나 다른 키워드로 검색해 보세요.</p>
              </div>
            </div>
            <Button asChild size="lg" className="text-sub3_sb_16">
              <Link href="/">홈 화면으로 돌아가기</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-2 gap-y-5">
            {pagedResults.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <Pagination className="mt-10">
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

            {getVisiblePages(paginationPages).map((page) => (
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
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(currentPage + 1)
                }}
                className={currentPage === paginationPages ? 'pointer-events-none opacity-40' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <SearchModal
        key={String(isSearchOpen)}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResultsContent />
    </Suspense>
  )
}
