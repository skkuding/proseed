'use client'

import { useEffect, useState } from 'react'
import { MyFeedbackCard } from './_components/MyFeedbackCard'
import { FeedbackFilterSortPanel } from './_components/FeedbackFilterSortPanel'
import { getMyFeedbacks, type MyFeedbackProjectItemDto } from '@/lib/api'

type FilterMode = 'all' | 'adopted'

export default function MyFeedbacks() {
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [feedbacks, setFeedbacks] = useState<MyFeedbackProjectItemDto[]>([])

  useEffect(() => {
    getMyFeedbacks().then(setFeedbacks).catch(console.error)
  }, [])

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
            <MyFeedbackCard
              key={feedback.submissionId}
              feedbackId={feedback.submissionId}
              createdAt={feedback.createdAt}
              isAdopted={feedback.isAdopted}
              oneLineDescription={feedback.oneLineDescription}
              projectId={feedback.projectId}
              projectName={feedback.projectTitle}
              projectIconUrl={feedback.projectThumbnailUrl}
            />
          ))}
        </div>
      )}
    </div>
  )
}
