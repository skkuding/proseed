'use client'

import { useEffect, useState } from 'react'
import { Dot } from 'lucide-react'
import { XIcon } from 'lucide-react'
import { getFeedbackTemplates, type FeedbackTemplate } from '@/lib/api'
import { JOB_TABS, RECORD_CATEGORY_TO_API, type JobTab } from '@/app/_utils/projectConstants'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const TABS = JOB_TABS
type TabLabel = JobTab

const ITEMS_PER_PAGE = 4

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackTemplateModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabLabel>('기획')
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([])

  useEffect(() => {
    if (!isOpen) return
    getFeedbackTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]))
  }, [isOpen])

  if (!isOpen) return null

  const category = RECORD_CATEGORY_TO_API[activeTab]
  const questions = templates.find((d) => d.category === category)?.questions ?? []
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

  const getPageNumbers = () => Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-270 bg-background-normal rounded-[20px] flex flex-col overflow-hidden px-7 pt-10 pb-13 gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-head3_sb_36">프로젝트 피드백 질문 템플릿</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center hover:cursor-pointer"
              aria-label="닫기"
            >
              <XIcon className="size-9 text-neutral-30" />
            </button>

            {/* <div className="flex gap-2">
              <Button variant="outline" size="md" className="text-sub3_sb_16" onClick={onClose}>
                취소하기
              </Button>
              <Button size="md" className="text-sub3_sb_16" onClick={onClose}>
                선택한 템플릿 사용하기
              </Button>
            </div> */}
          </div>
          {/* Tabs */}
          <div className="shrink-0">
            <div className="flex">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`text-body2_m_14 w-21 h-[38px] px-4 py-2 hover:cursor-pointer transition-colors relative ${
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
        </div>

        {/* Question list */}
        <div className="flex flex-col gap-2 min-h-[388px]">
          {pagedQuestions.map((question, index) => {
            const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index
            const isCopied = copiedIndex === globalIndex

            return (
              <button
                key={globalIndex}
                onClick={() => handleCopy(question, globalIndex)}
                className="flex w-full h-[91px] items-center bg-white rounded-[12px] pl-3 pr-4 py-5 text-left hover:bg-neutral-95 hover:cursor-pointer transition-colors relative"
              >
                <Dot className="size-6 text-primary-strong shrink-0" />
                <span className="text-sub1_sb_18 flex-1">{question}</span>
                {isCopied && (
                  <span className="shrink-0 text-caption1_m_13 text-primary-strong bg-primary-strong/10 px-2 py-1 rounded-[4px]">
                    복사되었습니다
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-2 items-center shrink-0">
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

                {getPageNumbers().map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(page)
                      }}
                      className="hover:cursor-pointer"
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
