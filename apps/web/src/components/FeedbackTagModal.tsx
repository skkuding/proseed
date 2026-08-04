'use client'

import { useEffect, useState } from 'react'
import { Dot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getFeedbacksForVersion,
  getFreeformFeedbacks,
  type FeedbackListItemDto,
  type RecordCategory,
} from '@/lib/api'
import { useFeedbackTagStore, type TaggedFeedbackEntry } from '@/store/feedbackTagStore'
import {
  JOB_TABS,
  RECORD_CATEGORY_TO_API,
  jobTabToPersonLabel,
  type JobTab,
} from '@/app/_utils/projectConstants'
import { FeedbackTagCard, buildSubmissionCards } from './FeedbackTagCard'
import { FeedbackTagDetailView } from './FeedbackTagDetailView'

const MAX_PER_TAB = 3

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
    if (!isOpen) return
    // 성장기록(버전)이 아직 없는 프로젝트는 이전 버전 대신 자유 피드백을 태그 대상으로 불러온다
    const fetchFeedbacks = previousVersionId
      ? getFeedbacksForVersion(projectId, previousVersionId)
      : getFreeformFeedbacks(projectId)
    fetchFeedbacks.then(setFeedbacks).catch(() => setFeedbacks([]))
  }, [isOpen, previousVersionId, projectId])

  if (!isOpen) return null

  const activeCategory = RECORD_CATEGORY_TO_API[activeTab] as RecordCategory
  const cards = buildSubmissionCards(feedbacks.filter((f) => f.category === activeCategory))
  const selected = selectedByCategory[activeCategory] ?? []

  const isSelected = (userId: number) => selected.some((e) => e.userId === userId)

  const toggleSelect = (card: (typeof cards)[number]) => {
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
        versionId: previousVersionId,
        userId: card.userId,
        submissionId: card.submissionId,
        author: card.author,
        oneLineReview: card.oneLineReview,
      }
      return { ...prev, [activeCategory]: [...current, entry] }
    })
  }

  const openDetail = (card: (typeof cards)[number]) => {
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
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 "
        onClick={onClose}
      >
        <div
          className="w-270 bg-background-normal rounded-2xl overflow-hidden"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <FeedbackTagDetailView
            card={detailCard}
            activeTabLabel={activeTab}
            isSelected={isSelected(detailCard.userId)}
            canSelect={selected.length < MAX_PER_TAB}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
            onBack={() => setDetailSubmissionId(null)}
            onToggleSelect={() => {
              toggleSelect(detailCard)
              setDetailSubmissionId(null)
            }}
          />
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
                    className={`text-body2_m_14 w-25 h-[38px] px-4 py-2 whitespace-nowrap hover:cursor-pointer transition-colors relative ${
                      activeTab === tab ? 'text-black' : 'text-neutral-40'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      {activeTab === tab && <Dot className="size-8 m-[-10px]" />}
                      {jobTabToPersonLabel(tab)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Feedback list */}
        <div className="overflow-y-auto flex-1 px-8 pt-4 pb-6">
          {cards.filter((c) => !c.isAdopted).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20">
              <div className="flex flex-col items-center gap-2">
                <p className="text-title3_sb_24">등록된 피드백이 없습니다</p>
                <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
                  <p>아직 등록된 피드백이 없어요. 내 프로젝트에</p>
                  <p>피드백이 등록된 이후에 피드백을 태그할 수 있습니다.</p>
                </div>
              </div>
              <Button size="lg" className="text-sub3_sb_16" onClick={onClose}>
                이전 화면으로 돌아가기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {cards
                .filter((c) => !c.isAdopted)
                .map((card) => (
                  <FeedbackTagCard
                    key={card.submissionId}
                    card={card}
                    activeTabLabel={activeTab}
                    isSelected={isSelected(card.userId)}
                    disabled={!isSelected(card.userId) && selected.length >= MAX_PER_TAB}
                    onToggle={() => toggleSelect(card)}
                    onOpenDetail={() => openDetail(card)}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
