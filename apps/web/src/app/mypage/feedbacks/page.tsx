'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown, RotateCcw } from 'lucide-react'
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
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [sort, setSort] = useState('latest')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [pendingFilter, setPendingFilter] = useState<FilterMode>('all')
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
        <SideNav activeMenu="profile" onMenuChange={() => {}} />
        {/* router.push(`/mypage?tab=${menu}`) — 소셜 로그인 복구 시 원복 */}
      </div>

      <div className="flex-1 min-w-0 bg-white px-9 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-head3_sb_36 text-black">작성한 피드백</h2>
          <div className="flex items-center gap-2">
            {/* 필터 패널 */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => {
                  if (!showFilterDropdown) setPendingFilter(filterMode)
                  setShowFilterDropdown((prev) => !prev)
                }}
                className="inline-flex items-center gap-1 rounded-[8px] border border-neutral-90 px-4 py-[11px] text-body1_m_16 text-black hover:bg-neutral-99 transition-colors"
              >
                <Image src="/filter.svg" width={24} height={24} alt="필터" />
                필터
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 top-full z-20 mt-2 w-[428px] rounded-[12px] border border-neutral-90 bg-white p-6 shadow-md flex flex-col gap-6">
                  {/* div1 */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-title3_sb_24 text-black">필터 설정하기</h3>
                    <button
                      onClick={() => setPendingFilter('all')}
                      className="flex items-center gap-1 text-body2__m_14 text-neutral-40 transition-colors hover:cursor-pointer hover:text-neutral-30"
                    >
                      <RotateCcw className="size-4" />
                      필터 초기화
                    </button>
                  </div>

                  {/* div2 */}
                  <div className="flex flex-col gap-3">
                    <p className="text-body1__m_16 text-neutral-30">피드백 노출</p>
                    <div className="flex gap-2">
                      {FILTER_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPendingFilter(option.value)}
                          className={`h-11 rounded-[8px] px-4 py-[9px] text-body1_m_16 transition-colors hover:cursor-pointer ${
                            pendingFilter === option.value
                              ? 'bg-CoolNeutral-30 text-white'
                              : 'bg-neutral-99 text-neutral-30'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* div3 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="h-12 flex-1 rounded-[8px] border border-CoolNeutral-50 bg-white px-5 py-[13px] text-sub3_sb_16 text-CoolNeutral-20 transition-colors hover:cursor-pointer hover:bg-neutral-99"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode(pendingFilter)
                        setShowFilterDropdown(false)
                      }}
                      className="h-12 flex-1 rounded-[8px] bg-CoolNeutral-20 px-5 py-[13px] text-sub3_sb_16 text-white transition-colors hover:cursor-pointer hover:bg-CoolNeutral-30"
                    >
                      적용하기
                    </button>
                  </div>
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
