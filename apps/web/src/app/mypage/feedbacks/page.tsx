'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { UserInfoCard } from '../_components/UserInfoCard'
import { SideNav } from '../_components/SideNav'
import { MyFeedbackCard } from './_components/MyFeedbackCard'
import { authClient } from '@/lib/auth-client'

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

const FEEDBACKS: FeedbackItem[] = []

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된 순' },
]

const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: 'all', label: '전체 피드백' },
  { value: 'adopted', label: '채택된 피드백만 보기' },
]

export default function MyFeedbacks() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [sort, setSort] = useState('latest')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/')
    }
  }, [isPending, session, router])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false)
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (isPending || !session) return null

  const user = session.user

  const displayed = FEEDBACKS.filter((f) => filterMode === 'all' || f.isAdopted).sort((a, b) =>
    sort === 'oldest'
      ? a.createdAt.localeCompare(b.createdAt)
      : b.createdAt.localeCompare(a.createdAt)
  )

  const currentSort = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '최신순'

  return (
    <div className="flex items-start gap-6">
      <div className="flex w-100 min-w-[260px] shrink-0 flex-col gap-3">
        <UserInfoCard
          name={user.name ?? ''}
          email={user.email}
          job={''}
          loginProvider={''}
          profileImageUrl={user.image ?? ''}
          projectCount={0}
          feedbackCount={0}
        />
        <SideNav activeMenu="profile" onMenuChange={(menu) => router.push(`/mypage?tab=${menu}`)} />
      </div>

      <div className="flex-1 min-w-0 rounded-2xl bg-white px-9 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-head3_sb_36 text-black">작성한 피드백</h2>
          <div className="flex items-center gap-2">
            {/* 필터 드롭다운 */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilterDropdown((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-[8px] border border-neutral-90 px-4 py-[11px] text-body1_m_16 text-black hover:bg-neutral-99 transition-colors"
              >
                <Image src="/filter.svg" width={24} height={24} alt="필터" />
                필터
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 top-full z-20 mt-1 w-[200px] overflow-hidden rounded-[8px] border border-neutral-90 bg-white shadow-md">
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterMode(option.value)
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-body1_m_16 transition-colors hover:bg-neutral-99 ${
                        filterMode === option.value
                          ? 'text-CoolNeutral-20 font-semibold'
                          : 'text-black'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 정렬 드롭다운 */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSortDropdown((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-[8px] border border-neutral-90 pl-6 pr-4 py-[11px] text-body1_m_16 text-black hover:bg-neutral-99 transition-colors"
              >
                {currentSort}
                <ChevronDown
                  className={`size-4 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 top-full z-20 mt-1 w-[140px] overflow-hidden rounded-[8px] border border-neutral-90 bg-white shadow-md">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSort(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-body1_m_16 transition-colors hover:bg-neutral-99 ${
                        sort === option.value ? 'text-CoolNeutral-20 font-semibold' : 'text-black'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-body1_m_16 text-neutral-40">
            아직 작성한 피드백이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {displayed.map((feedback) => (
              <MyFeedbackCard key={feedback.feedbackId} {...feedback} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
