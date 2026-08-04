'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import FeedbackCard, { FeedbackCardSkeleton } from './FeedbackCard'
import SectionTitle from './SectionTitle'
import { getRecentFeedbacks, type RecentFeedbackItemDto } from '@/lib/api'

export default function FeedbackSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const [recentFeedbacks, setRecentFeedbacks] = useState<RecentFeedbackItemDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getRecentFeedbacks()
      .then(setRecentFeedbacks, () => setRecentFeedbacks([]))
      .finally(() => setIsLoading(false))
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
    el.scrollTo({ left: dir === 'right' ? el.scrollWidth : 0, behavior: 'smooth' })
  }

  const isEmpty = !isLoading && recentFeedbacks.length === 0

  return (
    <section className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <SectionTitle title="최근 피드백을 모아봤어요" />
        <div className="flex gap-4">
          <button
            onClick={() => scroll('left')}
            disabled={isEmpty || !canLeft}
            className="flex h-10 w-10 pr-[2px] justify-center rounded-full cursor-pointer bg-CoolNeutral-30 transition-colors hover:bg-CoolNeutral-40 disabled:opacity-40"
          >
            <Image src="/arrow3_left.svg" alt="이전" width={20} height={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={isEmpty || !canRight}
            className="flex h-10 w-10 pl-1 justify-center rounded-full cursor-pointer bg-CoolNeutral-30 transition-colors hover:bg-CoolNeutral-40 disabled:opacity-40"
          >
            <Image src="/arrow3_right.svg" alt="다음" width={20} height={20} />
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="flex flex-col items-center gap-2">
            <p className="text-title3_sb_24">아직 등록된 피드백이 없습니다</p>
            <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
              <p>피드백을 남겨 응원하는 서비스의 성장을</p>
              <p>함께 만들어 보세요</p>
            </div>
          </div>
          <Button asChild size="lg" className="text-sub3_sb_16">
            <Link href="/navigate">피드백 작성하기</Link>
          </Button>
        </div>
      ) : (
        <div
          ref={trackRef}
          onScroll={updateButtons}
          className="flex gap-4 overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, idx) => <FeedbackCardSkeleton key={idx} />)
            : recentFeedbacks.map((feedback) => (
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
      )}
    </section>
  )
}
