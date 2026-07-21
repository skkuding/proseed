'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import FeedbackCard from './FeedbackCard'
import SectionTitle from './SectionTitle'
import { getRecentFeedbacks, type RecentFeedbackItemDto } from '@/lib/api'

export default function FeedbackSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const [recentFeedbacks, setRecentFeedbacks] = useState<RecentFeedbackItemDto[]>([])

  useEffect(() => {
    getRecentFeedbacks().then(setRecentFeedbacks, () => setRecentFeedbacks([]))
  }, [])

  const updateButtons = () => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 0)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth ?? 0
    el.scrollBy({ left: dir === 'right' ? cardWidth + 16 : -(cardWidth + 16), behavior: 'smooth' })
  }

  return (
    <section className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <SectionTitle title="최근 피드백을 모아봤어요" />
        <div className="flex gap-4">
          <button
            onClick={() => scroll('left')}
            disabled={!canLeft}
            className="flex h-10 w-10 pr-[2px] justify-center rounded-full cursor-pointer bg-CoolNeutral-30 transition-colors hover:bg-CoolNeutral-40 disabled:opacity-40"
          >
            <Image src="/arrow3_left.svg" alt="이전" width={20} height={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canRight}
            className="flex h-10 w-10 pl-1 justify-center rounded-full cursor-pointer bg-CoolNeutral-30 transition-colors hover:bg-CoolNeutral-40 disabled:opacity-40"
          >
            <Image src="/arrow3_right.svg" alt="다음" width={20} height={20} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateButtons}
        className="flex gap-4 overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {recentFeedbacks.map((feedback) => (
          <div key={`${feedback.submissionId}-${feedback.category}`} className="shrink-0">
            <FeedbackCard
              submissionId={feedback.submissionId}
              versionId={feedback.versionId}
              nickname={feedback.nickname}
              profileImageUrl={feedback.profileImageUrl}
              category={feedback.category}
              onelineReview={feedback.oneLineReview}
              content={feedback.content}
              projectId={feedback.projectId}
              projectName={feedback.projectName}
              projectIconUrl={feedback.projectIconUrl}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
