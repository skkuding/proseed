'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, Dot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getFeedbacksForVersion, type FeedbackListItemDto, type RecordCategory } from '@/lib/api'
import { useFeedbackTagStore, type TaggedFeedbackEntry } from '@/store/feedbackTagStore'
import { JOB_TABS, RECORD_CATEGORY_TO_API, type JobTab } from '@/app/_utils/projectConstants'

const MAX_PER_TAB = 3

type SubmissionQuestion = {
  questionId: number
  questionTitle: string
  questionContent: string
  content: string
  imageUrls: string[]
}

type SubmissionCard = {
  submissionId: number
  userId: number
  isAdopted: boolean
  author: { name: string; profileImageUrl: string }
  oneLineReview: string
  questions: SubmissionQuestion[]
}

function buildSubmissionCards(items: FeedbackListItemDto[]): SubmissionCard[] {
  const bySubmission = new Map<number, SubmissionCard>()
  for (const item of items) {
    const card = bySubmission.get(item.submissionId) ?? {
      submissionId: item.submissionId,
      userId: item.userId,
      isAdopted: item.isAdopted,
      author: { name: item.author.name, profileImageUrl: item.author.profileImageUrl },
      oneLineReview: item.oneLineReview,
      questions: [],
    }
    card.questions.push({
      questionId: item.questionId,
      questionTitle: item.questionTitle,
      questionContent: item.questionContent,
      content: item.content,
      imageUrls: item.imageUrls,
    })
    bySubmission.set(item.submissionId, card)
  }
  return [...bySubmission.values()]
}

interface Props {
  isOpen: boolean
  onClose: () => void
  projectId: string | number
  previousVersionId: number | null
  initialCategory: RecordCategory
}

export function FeedbackTagModal({
  isOpen,
  onClose,
  projectId,
  previousVersionId,
  initialCategory,
}: Props) {
  const { taggedFeedbacks, setTaggedFeedbacks } = useFeedbackTagStore()
  const [feedbacks, setFeedbacks] = useState<FeedbackListItemDto[]>([])
  const [activeTab, setActiveTab] = useState<JobTab>(
    (Object.entries(RECORD_CATEGORY_TO_API).find(([, api]) => api === initialCategory)?.[0] ??
      '기획') as JobTab
  )
  const [selectedByCategory, setSelectedByCategory] =
    useState<Record<RecordCategory, TaggedFeedbackEntry[]>>(taggedFeedbacks)
  const [detailSubmissionId, setDetailSubmissionId] = useState<number | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen || !previousVersionId) return
    getFeedbacksForVersion(projectId, previousVersionId)
      .then(setFeedbacks)
      .catch(() => setFeedbacks([]))
  }, [isOpen, previousVersionId, projectId])

  if (!isOpen) return null

  const activeCategory = RECORD_CATEGORY_TO_API[activeTab] as RecordCategory
  const cards = buildSubmissionCards(feedbacks.filter((f) => f.category === activeCategory))
  const selected = selectedByCategory[activeCategory] ?? []

  const isSelected = (card: SubmissionCard) => selected.some((e) => e.userId === card.userId)

  const toggleSelect = (card: SubmissionCard) => {
    setSelectedByCategory((prev) => {
      const current = prev[activeCategory] ?? []
      if (current.some((e) => e.userId === card.userId)) {
        return {
          ...prev,
          [activeCategory]: current.filter((e) => e.userId !== card.userId),
        }
      }
      if (current.length >= MAX_PER_TAB) return prev
      const entry: TaggedFeedbackEntry = {
        versionId: previousVersionId as number,
        userId: card.userId,
        submissionId: card.submissionId,
        author: card.author,
        oneLineReview: card.oneLineReview,
      }
      return { ...prev, [activeCategory]: [...current, entry] }
    })
  }

  const openDetail = (card: SubmissionCard) => {
    setDetailSubmissionId(card.submissionId)
    setSelectedQuestionId(card.questions[0]?.questionId ?? null)
  }

  const handleConfirm = () => {
    setTaggedFeedbacks(selectedByCategory)
    onClose()
  }

  const totalSelected = Object.values(selectedByCategory).flat().length

  const detailCard = cards.find((c) => c.submissionId === detailSubmissionId) ?? null

  // Detail view
  if (detailCard) {
    const currentQuestion =
      detailCard.questions.find((q) => q.questionId === selectedQuestionId) ??
      detailCard.questions[0]
    const detailSelected = isSelected(detailCard)

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 "
        onClick={onClose}
      >
        <div
          className="w-270 bg-background-normal rounded-2xl overflow-hidden"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <div className="max-h-165.5 overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="iconMuted"
                    size="bare"
                    onClick={() => setDetailSubmissionId(null)}
                  >
                    <ChevronLeftIcon className="size-6" />
                  </Button>
                  <h2 className="text-title1_sb_28 text-CoolNeutral-20">피드백 자세히 보기</h2>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    toggleSelect(detailCard)
                    setDetailSubmissionId(null)
                  }}
                  className={`px-6 text-sub3_sb_16 ${
                    detailSelected ? 'bg-neutral-200 text-CoolNeutral-40 hover:bg-neutral-300' : ''
                  }`}
                  disabled={!detailSelected && selected.length >= MAX_PER_TAB}
                >
                  {detailSelected ? '선택 해제하기' : '피드백 선택하기'}
                </Button>
              </div>

              {/* Body */}
              <div className="px-8 py-6 flex flex-col gap-5 bg-white rounded-xl mx-7 mb-10">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="relative w-17.5 h-17.5 rounded-full overflow-hidden shrink-0 bg-neutral-100">
                    <Image
                      src={detailCard.author.profileImageUrl}
                      alt={detailCard.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body2_m_14 text-primary-strong">{activeTab}</span>
                    <span className="text-[28px] font-semibold tracking-[-0.04em]">
                      {detailCard.author.name}
                    </span>
                  </div>
                </div>

                {/* One-line review */}
                <div className="bg-[#0000000A] border border-[#00000033] rounded-xl px-6 py-5">
                  <p className="text-title4_m_20 leading-[130%] truncate">
                    {detailCard.oneLineReview}
                  </p>
                </div>

                {/* Q&A */}
                <div className="flex min-h-50 gap-6">
                  {/* Sidebar */}
                  <div className="w-62.5 shrink-0 p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] rounded-lg flex flex-col">
                    <p className="text-title3_sb_20 mb-3">피드백 답변 바로가기</p>
                    <div className="flex flex-col">
                      {detailCard.questions.map((q) => {
                        const isQuestionSelected = selectedQuestionId === q.questionId
                        return (
                          <button
                            key={q.questionId}
                            onClick={() => setSelectedQuestionId(q.questionId)}
                            className={`flex justify-between items-center text-left w-full px-1 py-2 rounded-lg text-body1_m_16 text-CoolNeutral-20 transition-colors hover:bg-neutral-99 hover:cursor-pointer ${
                              isQuestionSelected ? 'bg-neutral-99' : ''
                            }`}
                          >
                            <div className="flex items-center gap-0.5">
                              <Dot className="size-4 shrink-0" />
                              <span className="max-w-37.5 truncate">{q.questionTitle}</span>
                            </div>
                            <ChevronRightIcon className="size-5 shrink-0 text-[#7B7B7B]" />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {currentQuestion && (
                      <div className="flex flex-col gap-6">
                        <h3 className="text-title5_sb_20">{currentQuestion.questionTitle}</h3>
                        <p className="text-body3_r_16 text-CoolNeutral-20 leading-relaxed whitespace-pre-line">
                          {currentQuestion.content}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[1080px] max-h-[662px] bg-background-normal rounded-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-8 shrink-0 gap-3 flex flex-col">
          <div className="flex items-center justify-between ">
            <h2 className="text-head3_sb_36">도움이 된 피드백 태그하기</h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="md" onClick={onClose} className="text-sub3_sb_16">
                취소하기
              </Button>
              <Button
                size="md"
                onClick={handleConfirm}
                disabled={totalSelected === 0}
                className="text-sub3_sb_16"
              >
                선택한 피드백 태그하기
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col gap-1">
            <div className="flex shrink-0">
              {JOB_TABS.map((tab) => {
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab)
                      setDetailSubmissionId(null)
                    }}
                    className={`text-body2_m_14 w-21 h-[38px] px-4 py-2 hover:cursor-pointer transition-colors relative ${
                      activeTab === tab ? 'text-black' : 'text-neutral-40'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      {activeTab === tab && <Dot className="size-8 m-[-10px]" />}
                      {tab}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="pl-5 text-caption1_m_13 text-CoolNeutral-50">
              직군당 최대 {MAX_PER_TAB}개 선택 가능 ({selected.length}/{MAX_PER_TAB})
            </p>
          </div>
        </div>

        {/* Feedback list */}
        <div className="overflow-y-auto flex-1 px-8 pt-4 pb-6">
          {!previousVersionId ? (
            <p className="text-body3_r_16 text-CoolNeutral-40 py-10 text-center">
              아직 발행된 성장기록이 없어 태그할 피드백이 없습니다.
            </p>
          ) : cards.filter((c) => !c.isAdopted).length === 0 ? (
            <p className="text-body3_r_16 text-CoolNeutral-40 py-10 text-center">
              해당 카테고리의 피드백이 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {cards
                .filter((c) => !c.isAdopted)
                .map((card) => {
                  const cardSelected = isSelected(card)
                  const disabled = !cardSelected && selected.length >= MAX_PER_TAB

                  return (
                    <div
                      key={card.submissionId}
                      onClick={() => {
                        if (disabled) return
                        toggleSelect(card)
                      }}
                      className={`rounded-2xl border p-5 flex flex-col gap-4 transition-colors ${disabled ? '' : 'hover:cursor-pointer'} ${
                        cardSelected
                          ? 'border-primary-strong bg-white'
                          : disabled
                            ? 'border-none bg-neutral-99 opacity-60'
                            : 'border-none bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-10">
                        {/* Profile */}
                        <div className="flex items-center gap-3">
                          <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden shrink-0">
                            <Image
                              src={card.author.profileImageUrl}
                              alt={card.author.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-body2_m_14 text-primary-strong">{activeTab}</span>
                            <span className="text-title5_sb_20 leading-tight">
                              {card.author.name}
                            </span>
                          </div>
                        </div>

                        {/* Checkbox */}
                        <div
                          className={`size-8 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                            cardSelected
                              ? 'bg-primary-strong border-primary-strong'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {cardSelected && (
                            <svg
                              viewBox="0 0 12 10"
                              className="size-4 text-white fill-none stroke-current stroke-2"
                            >
                              <polyline points="1,5 4.5,8.5 11,1" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* One-line review */}
                      <Button
                        variant="iconMuted"
                        size="bare"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetail(card)
                        }}
                        className="w-full text-left text-black"
                      >
                        <div className="rounded-[12px] border border-[#00000033] bg-[#0000000A] px-4 py-3 w-full">
                          <p className="text-body1_m_16 truncate">{card.oneLineReview}</p>
                        </div>
                      </Button>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
