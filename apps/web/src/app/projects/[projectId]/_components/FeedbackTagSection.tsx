'use client'

import { Button } from '@/components/ui/button'
import type { TaggedFeedbackEntry } from '@/store/feedbackTagStore'

interface FeedbackTagSectionProps {
  activeTabLabel: string
  taggedItems: TaggedFeedbackEntry[]
  maxCount: number
  onOpen: () => void
  onRemove: (versionId: number | null, userId: number) => void
}

export function FeedbackTagSection({
  activeTabLabel,
  taggedItems,
  maxCount,
  onOpen,
  onRemove,
}: FeedbackTagSectionProps) {
  return (
    <div className="flex flex-col gap-4 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-title1_sb_28">피드백 태그하기</h2>
          <p className="text-body3_r_16 text-CoolNeutral-40">
            업데이트에 도움이 되었던 피드백을 태그하여 고마움을 전달해보세요 (직군당 최대 {maxCount}
            개 선택 가능)
          </p>
        </div>
        <Button
          size="sm"
          onClick={onOpen}
          disabled={taggedItems.length >= maxCount}
          className="shrink-0 px-5 text-sub3_sb_16"
        >
          피드백 태그하기
        </Button>
      </div>
      {taggedItems.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {taggedItems.map((entry) => (
            <div
              key={`${entry.versionId}:${entry.userId}`}
              onClick={onOpen}
              className="flex flex-col gap-2 rounded-xl border border-neutral-200 px-5 py-4 hover:cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-caption1_m_13 text-primary-strong">{activeTabLabel}</span>
                  <span className="text-title5_sb_20 leading-tight">{entry.author.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(entry.versionId, entry.userId)
                  }}
                  className="w-15 shrink-0 text-sub4_sb_14"
                >
                  삭제
                </Button>
              </div>
              <p className="text-body2_m_14 text-neutral-30 line-clamp-2">{entry.oneLineReview}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
