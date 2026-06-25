'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserInfoCard } from '../_components/UserInfoCard'
import { SideNav } from '../_components/SideNav'
import { authClient } from '@/lib/auth-client'

export default function MyParticipatedProjects() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

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

      <div className="flex-1 min-w-0 rounded-2xl bg-white p-8">
        <h2 className="mb-6 text-title3_sb_24 text-neutral-10">참여한 프로젝트</h2>
        <div className="flex flex-col items-center justify-center py-20 text-neutral-40 text-body1_m_16">
          아직 참여한 프로젝트가 없습니다.
        </div>
      </div>
    </div>
  )
}
