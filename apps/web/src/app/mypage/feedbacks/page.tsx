'use client'

import { useState } from 'react'
import { MyFeedbackCard } from './_components/MyFeedbackCard'
import { FeedbackFilterSortPanel } from './_components/FeedbackFilterSortPanel'

type FilterMode = 'all' | 'adopted'

type FeedbackItem = {
  feedbackId: number
  createdAt: string
  isAdopted: boolean
  onelineReview: string
  content: string
  projectId: number
  projectName: string
  projectIconUrl: string
}

export default function MyFeedbacks() {
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [feedbacks] = useState<FeedbackItem[]>([])

  const displayed = feedbacks
    .filter((f) => filterMode === 'all' || f.isAdopted)
    .sort((a, b) =>
      sort === 'oldest'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt)
    )

  return (
    <div className="flex-1">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-head3_sb_36 text-black">작성한 피드백</h2>
        <FeedbackFilterSortPanel
          filterMode={filterMode}
          sort={sort}
          onApplyFilter={(value) => setFilterMode(value)}
          onChangeSort={(value) => setSort(value)}
        />
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-body1_m_16 text-neutral-40">
          아직 작성한 피드백이 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayed.map((feedback) => (
            <MyFeedbackCard key={feedback.feedbackId} {...feedback} />
          ))}
        </div>
      )}
    </div>
  )
}
