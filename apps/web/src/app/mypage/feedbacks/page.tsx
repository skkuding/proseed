'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MyFeedbackCard } from './_components/MyFeedbackCard'
import { FeedbackFilterSortPanel } from './_components/FeedbackFilterSortPanel'
import { Button } from '@/components/ui/button'
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
        <div className="flex flex-col items-center justify-center gap-6 py-30">
          <div className="flex flex-col items-center gap-2">
            <p className="text-title3_sb_24">아직 작성한 피드백이 없어요</p>
            <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
              <p>아직 피드백을 작성하지 않았어요.</p>
              <p>관심 있는 프로젝트에 의견을 남겨보세요.</p>
            </div>
          </div>
          <Button asChild size="lg" className="text-sub3_sb_16">
            <Link href="/myproject">프로젝트 참여하기</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayed.map((feedback) => (
            <MyFeedbackCard
              key={feedback.submissionId}
              feedbackId={feedback.submissionId}
              versionId={feedback.versionId}
              createdAt={feedback.createdAt}
              isAdopted={feedback.isAdopted}
              oneLineDescription={feedback.oneLineDescription}
              projectId={feedback.projectId}
              projectName={feedback.projectTitle}
              projectIconUrl={feedback.projectIconUrl}
            />
          ))}
        </div>
      )}
    </div>
  )
}
