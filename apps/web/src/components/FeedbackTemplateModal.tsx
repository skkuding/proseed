'use client'

import { useState } from 'react'
import { XIcon, Dot } from 'lucide-react'
import templateData from '@/app/_mockdata/project-detail/project-growthRecord-feedbacktemplate.json'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const TABS = ['기획자', '디자이너', '개발자', '기타'] as const
type TabLabel = (typeof TABS)[number]

const TAB_TO_CATEGORY: Record<TabLabel, string> = {
  기획자: 'PLAN',
  디자이너: 'DESIGN',
  개발자: 'DEVELOPMENT',
  기타: 'GENERAL',
}

const ITEMS_PER_PAGE = 4

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackTemplateModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabLabel>('기획자')
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!isOpen) return null

  const category = TAB_TO_CATEGORY[activeTab]
  const questions = templateData.find((d) => d.category === category)?.questions ?? []
  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE)
  const pagedQuestions = questions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleTabChange = (tab: TabLabel) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages]
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-270 bg-background-normal rounded-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 shrink-0">
          <h2 className="text-title1_sb_28 text-CoolNeutral-20">프로젝트 피드백 질문 템플릿</h2>
          <button
            onClick={onClose}
            className="text-CoolNeutral-40 hover:text-CoolNeutral-20 hover:cursor-pointer transition-colors"
          >
            <XIcon className="size-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 shrink-0">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`pb-3 text-body2_m_14 w-21 h-[38px] px-auto py-2 hover:cursor-pointer transition-colors relative ${
                  activeTab === tab ? 'text-black' : 'text-neutral-40'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {activeTab === tab && <Dot className="size-8 m-[-10px]" />}
                  {tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Question list */}
        <div className="px-8 py-4 flex flex-col gap-3 min-h-[300px]">
          {pagedQuestions.map((question, index) => {
            const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index
            const isCopied = copiedIndex === globalIndex

            return (
              <button
                key={globalIndex}
                onClick={() => handleCopy(question, globalIndex)}
                className="flex w-5xl h-[91px] items-center gap-3 bg-white rounded-xl px-5 py-4 text-left hover:bg-neutral-99 hover:cursor-pointer transition-colors border border-transparent hover:border-neutral-200 relative"
              >
                <Dot className="size-6 text-primary-strong shrink-0 m-[-6px]" />
                <span className="text-sub1_sb_18 flex-1">{question}</span>
                {isCopied && (
                  <span className="shrink-0 text-caption1_m_13 text-primary-strong bg-primary-strong/10 px-2 py-1 rounded-md">
                    복사되었습니다
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-5 shrink-0">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage((p) => p - 1)
                    }}
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-40' : 'hover:cursor-pointer'
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, i) =>
                  page === '...' ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page as number)
                        }}
                        className="hover:cursor-pointer"
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
                      if (currentPage < totalPages) setCurrentPage((p) => p + 1)
                    }}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-40'
                        : 'hover:cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
