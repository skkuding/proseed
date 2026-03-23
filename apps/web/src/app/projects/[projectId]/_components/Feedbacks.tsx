'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  SlidersHorizontalIcon,
  RotateCcwIcon,
  Dot,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import versionList from '@/app/_mockdata/project-detail/project-version.json'
import feedbackData from '@/app/_mockdata/project-detail/project-feedback.json'
import { ImageLightbox } from './ImageLightbox'
import { usePathname, useRouter } from 'next/navigation'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { FeedbackRoleSelectModal } from '@/components/FeedbackRoleSelectModal'

const TABS = ['기획자', '디자이너', '개발자', '기타'] as const
type TabLabel = (typeof TABS)[number]

const TAB_TO_CATEGORY: Record<TabLabel, keyof typeof feedbackData.feedbacks> = {
  기획자: 'plan',
  디자이너: 'design',
  개발자: 'dev',
  기타: 'general',
}

const CATEGORY_LABEL: Record<string, string> = {
  plan: '기획자',
  design: '디자이너',
  dev: '개발자',
  general: '기타',
}

type FeedbackQuestion = {
  questionId: number
  questionTitle: string
  questionContent: string
  feedbackBody: string
  images: string[]
}

type FeedbackItem = {
  feedbackId: number
  username: string
  nickname: string
  profileImageUrl: string
  createdAt: string
  category: string
  onelineReview: string
  isAdopted: boolean
  isOpened: boolean
  questions: FeedbackQuestion[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`
}

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

type FilterMode = 'all' | 'closed'

export function Feedbacks() {
  const pathname = usePathname()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabLabel>('기획자')
  const [selectedVersion, setSelectedVersion] = useState(versionList[0].id.toString())
  const [currentPage, setCurrentPage] = useState(1)
  const [openFeedbackId, setOpenFeedbackId] = useState<string>('')
  const [selectedQuestions, setSelectedQuestions] = useState<Record<number, number>>({})
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [pendingFilter, setPendingFilter] = useState<FilterMode>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('latest')
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)
  const [showRoleSelectModal, setShowRoleSelectModal] = useState(false)

  const handleRoleSelectConfirm = (selectedRoles: string[]) => {
    setShowRoleSelectModal(false)
    const roles = selectedRoles.map((r) => TAB_TO_CATEGORY[r as TabLabel]).join(',')
    router.push(`${pathname}/create?version=${selectedVersion}&roles=${roles}`)
  }

  const category = TAB_TO_CATEGORY[activeTab]
  const allFeedbacks = (feedbackData.feedbacks[category] as FeedbackItem[]).filter((f) =>
    filterMode === 'all' ? true : f.isOpened
  )
  const pageSize = 5
  const totalPages = Math.ceil(allFeedbacks.length / pageSize)
  const feedbacks = allFeedbacks.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleTabChange = (tab: TabLabel) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setOpenFeedbackId('')
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    setOpenFeedbackId('')
  }

  const handleAccordionChange = (value: string) => {
    setOpenFeedbackId(value)
    if (value) {
      const feedbackId = parseInt(value)
      if (!selectedQuestions[feedbackId]) {
        const feedback = feedbacks.find((f) => f.feedbackId === feedbackId)
        if (feedback?.questions[0]) {
          setSelectedQuestions((prev) => ({
            ...prev,
            [feedbackId]: feedback.questions[0].questionId,
          }))
        }
      }
    }
  }

  const getSelectedQuestion = (feedback: FeedbackItem): FeedbackQuestion | undefined => {
    const questionId = selectedQuestions[feedback.feedbackId] ?? feedback.questions[0]?.questionId
    return feedback.questions.find((q) => q.questionId === questionId)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-head3_sb_36">프로젝트 피드백</h1>
          <p className="text-body3_r_16 text-CoolNeutral-40 mt-2">
            피드백을 작성하고 프로젝트 리뷰 티켓을 받아보세요!
          </p>
        </div>
        <div className="flex items-center">
          <div className="min-h-12">
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="px-4 rounded-lg border-neutral-200 text-body1_m_16! hover:cursor-pointer">
                <SelectValue>
                  업데이트 버전{' '}
                  {versionList.find((v) => v.id.toString() === selectedVersion)?.version}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {versionList.map((v) => (
                  <SelectItem
                    key={v.id}
                    value={v.id.toString()}
                    className="text-body1_m_16! hover:cursor-pointer"
                  >
                    버전 {v.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* 피드백 버튼 누르면 /create 페이지로 이동 */}
          <Button
            onClick={() => setShowRoleSelectModal(true)}
            disabled={selectedVersion !== versionList[0].id.toString()}
            className="ml-1.5 h-12 w-[137px] px-5 py-[13px] bg-CoolNeutral-20 hover:cursor-pointer"
          >
            <p className="text-sub3_sb_16 text-white">피드백 작성하기</p>
          </Button>
        </div>
      </div>

      {/* Role filter tabs + filter button */}
      <div className="flex items-center justify-between">
        <RoleFilterTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tab) => handleTabChange(tab as TabLabel)}
        />

        {/* Sort & Filter */}
        <div className="flex items-center gap-2">
          <Popover
            open={isFilterOpen}
            onOpenChange={(open) => {
              if (open) setPendingFilter(filterMode)
              setIsFilterOpen(open)
            }}
          >
            <PopoverTrigger asChild>
              <button
                className={`flex w-23 h-12 items-center justify-between pl-4 py-2 pr-6 rounded-lg border text-body3_r_16 transition-colors hover:cursor-pointer ${
                  filterMode !== 'all'
                    ? 'border-CoolNeutral-20 bg-neutral-99'
                    : 'border-neutral-200 hover:border-CoolNeutral-40'
                }`}
              >
                <SlidersHorizontalIcon className="size-4 text-neutral-30" />
                <p className="text-body1_m_16">필터</p>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-107 h-64 rounded-2xl border-neutral-200 p-5 flex flex-col gap-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.12)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-title1_sb_24">필터 설정하기</span>
                <button
                  onClick={() => setPendingFilter('all')}
                  className="flex items-center gap-1 text-caption1_m_13 text-CoolNeutral-40 hover:text-CoolNeutral-20 hover:cursor-pointer transition-colors"
                >
                  <RotateCcwIcon className="size-4" />
                  <p className="text-body2_m_14">필터 초기화</p>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-body1_m_16 text-CoolNeutral-40">피드백 노출</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPendingFilter('all')}
                    className={`px-4 py-2 rounded-lg h-11 text-body3_r_16 transition-colors hover:cursor-pointer ${
                      pendingFilter === 'all'
                        ? 'bg-CoolNeutral-30 text-white'
                        : 'bg-neutral-99 text-neutral-30 hover:bg-neutral-200'
                    }`}
                  >
                    전체 피드백
                  </button>
                  <button
                    onClick={() => setPendingFilter('closed')}
                    className={`px-4 py-2 rounded-lg h-11 text-body3_r_16 transition-colors hover:cursor-pointer ${
                      pendingFilter === 'closed'
                        ? 'bg-CoolNeutral-30 text-white'
                        : 'bg-neutral-99 text-neutral-30 hover:bg-neutral-200'
                    }`}
                  >
                    해제한 피드백만 보기
                  </button>
                </div>
              </div>

              <div className="flex gap-1 justify-end">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="py-2.5 rounded-lg h-12 w-23.5 border-[1.4px] border-CoolNeutral-50 text-body3_r_16 text-CoolNeutral-40 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
                >
                  <p className="text-sub3_sb_16 text-CoolNeutral-20">취소</p>
                </button>
                <button
                  onClick={() => {
                    setFilterMode(pendingFilter)
                    setCurrentPage(1)
                    setOpenFeedbackId('')
                    setIsFilterOpen(false)
                  }}
                  className="py-2.5 rounded-lg h-12 w-23.5 bg-CoolNeutral-20 text-body3_r_16 text-white hover:bg-CoolNeutral-30 hover:cursor-pointer transition-colors"
                >
                  <p className="text-sub3_sb_16 ">적용하기</p>
                </button>
              </div>
            </PopoverContent>
          </Popover>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[105px] h-12 pr-4 pl-6 rounded-lg border-neutral-200 text-body1_m_16! gap-2 hover:cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest" className="text-body1_m_16! hover:cursor-pointer">
                최신순
              </SelectItem>
              <SelectItem value="oldest" className="text-body1_m_16! hover:cursor-pointer">
                오래된순
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback list */}
      {feedbacks.length === 0 ? (
        <p className="text-body3_r_16 text-CoolNeutral-40 py-10 text-center">
          해당 카테고리의 피드백이 없습니다.
        </p>
      ) : (
        <div className="ml-[-20px]">
          <Accordion
            type="single"
            collapsible
            value={openFeedbackId}
            onValueChange={handleAccordionChange}
            className="flex flex-col pl-3"
          >
            {feedbacks.map((feedback) => {
              const isOpen = openFeedbackId === String(feedback.feedbackId)
              const selectedQuestion = getSelectedQuestion(feedback)
              const selectedQuestionId =
                selectedQuestions[feedback.feedbackId] ?? feedback.questions[0]?.questionId

              return (
                <AccordionItem
                  key={feedback.feedbackId}
                  value={String(feedback.feedbackId)}
                  className="overflow-hidden py-10 "
                >
                  {/* Trigger: Profile header */}
                  <AccordionTrigger className="[&>svg]:hidden items-center cursor-pointer pl-2">
                    <div className="flex items-center gap-4 w-full">
                      <div className="relative w-17.5 h-17.5 rounded-full overflow-hidden shrink-0 bg-neutral-100">
                        <Image
                          src={feedback.profileImageUrl}
                          alt={feedback.nickname}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className={`text-body2_m_14 text-primary-strong`}>
                          {CATEGORY_LABEL[feedback.category]}
                        </span>
                        <span className="text-[28px] font-semibold tracking-[-0.04em]">
                          {feedback.nickname}
                        </span>
                        <span className="text-body1_m_16 text-[#6E6E6E]">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                      <ChevronDownIcon
                        className={`ml-auto mr-5 size-10 text-CoolNeutral-20 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </AccordionTrigger>

                  {/* Always visible: one-line review */}
                  <div className="bg-[#0000000A] border border-[#00000033] rounded-xl px-6 py-5 h-[66px] mt-7 ml-2">
                    <p className="text-title4_m_20 leading-[130%] truncate">
                      {feedback.onelineReview}
                    </p>
                  </div>

                  {/* Expandable: Q&A content */}
                  <AccordionContent className="pb-0 pl-2 mt-10">
                    <div className="flex min-h-50 pb-6">
                      {/* Left sidebar */}
                      <div className="w-[283px] h-[254px] shrink-0 p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] rounded-lg flex flex-col">
                        <p className="text-title3_sb_20 mb-3">피드백 답변 바로가기</p>
                        <div className="flex flex-col">
                          {feedback.questions.map((q) => {
                            const isSelected = selectedQuestionId === q.questionId
                            return (
                              <button
                                key={q.questionId}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedQuestions((prev) => ({
                                    ...prev,
                                    [feedback.feedbackId]: q.questionId,
                                  }))
                                }}
                                className={`flex justify-between items-center text-left w-full px-1 py-2 rounded-lg text-body1_m_16 text-CoolNeutral-20 transition-colors hover:bg-neutral-99 hover:cursor-pointer ${
                                  isSelected ? 'bg-neutral-99' : ''
                                }`}
                              >
                                <div className="flex items-center gap-[2px]">
                                  <Dot className="size-4 shrink-0" />
                                  <span className="max-w-[185px] truncate">{q.questionTitle}</span>
                                </div>
                                <ChevronRightIcon className="size-6 shrink-0 text-[#7B7B7B]" />
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Right content */}
                      <div className="flex-1 px-10">
                        {selectedQuestion && (
                          <div className="flex flex-col gap-10">
                            <h3 className="text-title1_sb_24">{selectedQuestion.questionTitle}</h3>
                            <p className="text-body3_r_16 text-CoolNeutral-20 leading-relaxed whitespace-pre-line">
                              {selectedQuestion.feedbackBody}
                            </p>
                            {selectedQuestion.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-3 mt-1">
                                {selectedQuestion.images.map((img, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setLightbox({ images: selectedQuestion.images, index: idx })
                                    }}
                                    className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 hover:opacity-90 transition-opacity hover:cursor-pointer"
                                  >
                                    <Image src={img} alt="" fill className="object-cover" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
          {/* Pagination */}
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
        </div>
      )}

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          currentIndex={lightbox.index}
          isOpen={true}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox(
              (prev) =>
                prev && {
                  ...prev,
                  index: (prev.index - 1 + prev.images.length) % prev.images.length,
                }
            )
          }
          onNext={() =>
            setLightbox((prev) => prev && { ...prev, index: (prev.index + 1) % prev.images.length })
          }
        />
      )}

      <FeedbackRoleSelectModal
        isOpen={showRoleSelectModal}
        onClose={() => setShowRoleSelectModal(false)}
        onConfirm={handleRoleSelectConfirm}
      />
    </div>
  )
}
