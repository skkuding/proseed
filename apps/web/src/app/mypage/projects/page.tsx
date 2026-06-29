'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserInfoCard } from '../_components/UserInfoCard'
import { SideNav } from '../_components/SideNav'
import { authClient } from '@/lib/auth-client'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { JOB_FILTER_TABS, type JobFilter } from '@/app/_utils/projectConstants'

export default function MyParticipatedProjects() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [selectedJob, setSelectedJob] = useState<JobFilter>('기획')

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/')
    }
  }, [isPending, session, router])

  if (isPending || !session) return null

  const user = session.user

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

      <div className="w-235 rounded-[12px] bg-white px-9 py-10 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <p className="text-head3_sb_36 text-black">참여한 프로젝트</p>

          <RoleFilterTabs
            tabs={JOB_FILTER_TABS}
            activeTab={selectedJob}
            onTabChange={(tab) => setSelectedJob(tab as JobFilter)}
          />
        </div>

        <div className="flex flex-col items-center justify-center py-30 gap-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-title3_sb_24 text-black">아직 참여한 프로젝트가 없어요</p>
            <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
              <p>다양한 직군으로 참여하여</p>
              <p>프로젝트를 수행하고 커리어 성장을 이뤄세요</p>
            </div>
          </div>
          <Link
            href="/navigate"
            className="inline-flex items-center justify-center h-13 px-5 py-[15px] rounded-[8px] bg-CoolNeutral-20 text-white text-sub3_sb_16 hover:bg-CoolNeutral-30 transition-colors"
          >
            프로젝트 참여하기
          </Link>
        </div>
      </div>
    </div>
  )
}
