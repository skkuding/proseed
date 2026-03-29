'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserInfoCard } from '../_components/UserInfoCard'
import { SideNav } from '../_components/SideNav'
import { MyFeedbackCard } from './_components/MyFeedbackCard'
import { FeedbackFilterModal, type FilterMode } from './_components/FeedbackFilterModal'
import mockUser from '@/app/_mockdata/user/user-profile.json'
import recentFeedbacks from '@/app/_mockdata/mainpage/recent-feedbacks.json'

const MOCK_DATES = [
  '2026.03.21',
  '2026.03.15',
  '2026.03.08',
  '2026.02.27',
  '2026.02.14',
  '2026.02.03',
  '2026.01.28',
  '2026.01.19',
  '2026.01.11',
  '2026.01.02',
  '2025.12.25',
  '2025.12.17',
  '2025.12.09',
  '2025.11.30',
  '2025.11.22',
  '2025.11.13',
  '2025.11.05',
  '2025.10.27',
  '2025.10.18',
  '2025.10.09',
]

const MOCK_FEEDBACKS = recentFeedbacks.slice(0, mockUser.feedbackCount).map((f, i) => ({
  ...f,
  createdAt: MOCK_DATES[i] ?? '2025.10.01',
  isAdopted: i % 3 === 0,
}))

export default function MyFeedbacks() {
  const router = useRouter()
  const [sort, setSort] = useState('latest')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [showFilter, setShowFilter] = useState(false)

  const displayed = MOCK_FEEDBACKS.filter((f) => filterMode === 'all' || f.isAdopted).sort(
    (a, b) =>
      sort === 'oldest'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt)
  )

  return (
    <main className="min-h-screen pt-10">
      <div className="w-full flex flex-col gap-10">
        <div>
          <h1 className="text-head0_sb_52 text-black">마이페이지</h1>
          <p className="mt-2 text-title6_m_20 text-CoolNeutral-40">
            프로필 정보 수정부터 계정 설정, 궁금한 점 해결까지 간편하게 확인하세요
          </p>
        </div>

        <div className="flex items-start gap-6">
          <div className="flex w-100 min-w-[260px] shrink flex-col gap-3">
            <UserInfoCard
              name={mockUser.name}
              email={mockUser.email}
              job={mockUser.job}
              loginProvider={mockUser.loginProvider}
              profileImageUrl={mockUser.profileImageUrl}
              projectCount={mockUser.projectCount}
              feedbackCount={mockUser.feedbackCount}
            />
            <SideNav
              activeMenu="profile"
              onMenuChange={(menu) => router.push(`/mypage?tab=${menu}`)}
            />
          </div>

          <div className="flex-1 min-w-0 rounded-2xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-title3_sb_24 text-neutral-10">작성한 피드백</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilter(true)}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-neutral-90 px-4 py-2 text-body1_m_16 text-neutral-40 hover:bg-neutral-99 transition-colors"
                >
                  <SlidersHorizontal className="size-4" />
                  필터
                </button>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-28 rounded-[8px] border-neutral-90 text-body1_m_16 text-neutral-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="oldest">오래된 순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {displayed.map((feedback) => (
                <MyFeedbackCard key={feedback.feedbackId} {...feedback} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showFilter && (
        <FeedbackFilterModal
          mode={filterMode}
          onClose={() => setShowFilter(false)}
          onApply={setFilterMode}
        />
      )}
    </main>
  )
}
