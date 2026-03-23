'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, Dot } from 'lucide-react'
import feedbackData from '@/app/_mockdata/project-detail/project-feedback.json'
import { useFeedbackTagStore } from '@/store/feedbackTagStore'

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

const MAX_PER_TAB = 3

type Feedback = (typeof feedbackData.feedbacks.plan)[number]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackTagModal({ isOpen, onClose }: Props) {
  const { taggedFeedbacks, setTaggedFeedbacks } = useFeedbackTagStore()
  const [activeTab, setActiveTab] = useState<TabLabel>('기획자')
  const [selectedByTab, setSelectedByTab] = useState<Record<TabLabel, number[]>>({
    기획자: taggedFeedbacks.plan ?? [],
    디자이너: taggedFeedbacks.design ?? [],
    개발자: taggedFeedbacks.dev ?? [],
    기타: taggedFeedbacks.general ?? [],
  })
  const [detailFeedback, setDetailFeedback] = useState<Feedback | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)

  if (!isOpen) return null

  const category = TAB_TO_CATEGORY[activeTab]
  const feedbacks = feedbackData.feedbacks[category].filter((f) => f.isOpened)
  const selected = selectedByTab[activeTab]

  const toggleSelect = (feedbackId: number) => {
    setSelectedByTab((prev) => {
      const current = prev[activeTab]
      if (current.includes(feedbackId)) {
        return { ...prev, [activeTab]: current.filter((id) => id !== feedbackId) }
      }
      if (current.length >= MAX_PER_TAB) return prev
      return { ...prev, [activeTab]: [...current, feedbackId] }
    })
  }

  const openDetail = (feedback: Feedback) => {
    setDetailFeedback(feedback)
    setSelectedQuestionId(feedback.questions[0]?.questionId ?? null)
  }

  const handleConfirm = () => {
    setTaggedFeedbacks({
      plan: selectedByTab['기획자'],
      design: selectedByTab['디자이너'],
      dev: selectedByTab['개발자'],
      general: selectedByTab['기타'],
    })
    onClose()
  }

  const totalSelected = Object.values(selectedByTab).flat().length

  // Detail view
  if (detailFeedback) {
    const currentQuestion =
      detailFeedback.questions.find((q) => q.questionId === selectedQuestionId) ??
      detailFeedback.questions[0]
    const isSelected = selected.includes(detailFeedback.feedbackId)
    const detailCategory = detailFeedback.category

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
                  <button
                    onClick={() => setDetailFeedback(null)}
                    className="text-CoolNeutral-40 hover:text-CoolNeutral-20 hover:cursor-pointer transition-colors"
                  >
                    <ChevronLeftIcon className="size-6" />
                  </button>
                  <h2 className="text-title1_sb_28 text-CoolNeutral-20">피드백 자세히 보기</h2>
                </div>
                <button
                  onClick={() => {
                    toggleSelect(detailFeedback.feedbackId)
                    setDetailFeedback(null)
                  }}
                  className={`h-12 px-6 rounded-xl text-sub3_sb_16 hover:cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-neutral-200 text-CoolNeutral-40 hover:bg-neutral-300'
                      : 'bg-CoolNeutral-20 text-white hover:bg-CoolNeutral-30'
                  }`}
                  disabled={!isSelected && selected.length >= MAX_PER_TAB}
                >
                  {isSelected ? '선택 해제하기' : '피드백 선택하기'}
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-6 flex flex-col gap-5 bg-white rounded-xl mx-7 mb-10">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="relative w-17.5 h-17.5 rounded-full overflow-hidden shrink-0 bg-neutral-100">
                    <Image
                      src={detailFeedback.profileImageUrl}
                      alt={detailFeedback.nickname}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body2_m_14 text-primary-strong">
                      {CATEGORY_LABEL[detailCategory]}
                    </span>
                    <span className="text-[28px] font-semibold tracking-[-0.04em]">
                      {detailFeedback.nickname}
                    </span>
                  </div>
                </div>

                {/* One-line review */}
                <div className="bg-[#0000000A] border border-[#00000033] rounded-xl px-6 py-5">
                  <p className="text-title4_m_20 leading-[130%] truncate">
                    {detailFeedback.onelineReview}
                  </p>
                </div>

                {/* Q&A */}
                <div className="flex min-h-50 gap-6">
                  {/* Sidebar */}
                  <div className="w-62.5 shrink-0 p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] rounded-lg flex flex-col">
                    <p className="text-title3_sb_20 mb-3">피드백 답변 바로가기</p>
                    <div className="flex flex-col">
                      {detailFeedback.questions.map((q) => {
                        const isSelected = selectedQuestionId === q.questionId
                        return (
                          <button
                            key={q.questionId}
                            onClick={() => setSelectedQuestionId(q.questionId)}
                            className={`flex justify-between items-center text-left w-full px-1 py-2 rounded-lg text-body1_m_16 text-CoolNeutral-20 transition-colors hover:bg-neutral-99 hover:cursor-pointer ${
                              isSelected ? 'bg-neutral-99' : ''
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
                          {currentQuestion.feedbackBody}
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
        <div className="flex items-center justify-between px-8 py-6 shrink-0">
          <h2 className="text-title1_sb_28 text-CoolNeutral-20">도움이 된 피드백 태그하기</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="h-12 px-6 rounded-xl border border-neutral-200 text-sub3_sb_16 text-CoolNeutral-20 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
            >
              취소하기
            </button>
            <button
              onClick={handleConfirm}
              disabled={totalSelected === 0}
              className="h-12 px-6 rounded-xl bg-CoolNeutral-20 text-sub3_sb_16 text-white hover:bg-CoolNeutral-30 hover:cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              선택한 피드백 태그하기
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-5 shrink-0">
          <div className="flex">
            {TABS.map((tab) => {
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-body2_m_14 w-21 h-[38px] px-auto py-2 hover:cursor-pointer transition-colors relative ${
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
          <p className="text-caption1_m_13 text-CoolNeutral-50 mt-2 mb-1">
            직군당 최대 {MAX_PER_TAB}개 선택 가능 ({selected.length}/{MAX_PER_TAB})
          </p>
        </div>

        {/* Feedback list */}
        <div className="overflow-y-auto flex-1 px-8 py-4">
          {feedbacks.length === 0 ? (
            <p className="text-body3_r_16 text-CoolNeutral-40 py-10 text-center">
              해당 카테고리의 피드백이 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {feedbacks.map((feedback) => {
                const isSelected = selected.includes(feedback.feedbackId)
                const disabled = !isSelected && selected.length >= MAX_PER_TAB

                return (
                  <div
                    key={feedback.feedbackId}
                    className={`relative rounded-2xl border-2 p-5 flex flex-col gap-3 transition-colors ${
                      isSelected
                        ? 'border-primary-strong bg-white'
                        : disabled
                          ? 'border-none bg-neutral-99 opacity-60'
                          : 'border-none bg-white'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(feedback.feedbackId)}
                      disabled={disabled}
                      className="absolute top-4 right-4 hover:cursor-pointer disabled:cursor-not-allowed"
                    >
                      <div
                        className={`size-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-primary-strong border-primary-strong'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            viewBox="0 0 12 10"
                            className="size-3 text-white fill-none stroke-current stroke-2"
                          >
                            <polyline points="1,5 4.5,8.5 11,1" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Profile */}
                    <button
                      className="flex items-center gap-3 text-left hover:cursor-pointer w-fit"
                      onClick={() => openDetail(feedback)}
                    >
                      <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden shrink-0 bg-neutral-100">
                        <Image
                          src={feedback.profileImageUrl}
                          alt={feedback.nickname}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-body2_m_14 text-primary-strong`}>
                          {CATEGORY_LABEL[feedback.category]}
                        </span>
                        <span className="text-title3_sb_20 leading-tight">{feedback.nickname}</span>
                      </div>
                    </button>

                    {/* One-line review */}
                    <button
                      className="w-full text-left hover:cursor-pointer"
                      onClick={() => openDetail(feedback)}
                    >
                      <div className="bg-[#0000000A] border border-[#00000033] rounded-xl px-4 py-3">
                        <p className="text-body2_m_14 text-CoolNeutral-20 truncate">
                          {feedback.onelineReview}
                        </p>
                      </div>
                    </button>
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
