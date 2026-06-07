'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from './_components/ProfileForm'
import { AccountForm } from './_components/AccountForm'
import { UserInfoCard } from './_components/UserInfoCard'
import { SideNav } from './_components/SideNav'
import { authClient } from '@/lib/auth-client'

type MenuItem = 'profile' | 'account' | 'faq'

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('profile')
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/')
    }
  }, [isPending, session, router])

  if (isPending || !session) return null

  const { user } = session

  return (
    <main className="min-h-screen pt-10">
      <div className="w-full flex flex-col gap-10">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-head0_sb_52 text-black">마이페이지</h1>
          <p className="mt-2 text-title6_m_20 text-CoolNeutral-40">
            프로필 정보 수정부터 계정 설정, 궁금한 점 해결까지 간편하게 확인하세요
          </p>
        </div>

        {/* 콘텐츠 */}
        <div className="flex items-start gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="flex w-100 min-w-[260px] shrink flex-col gap-3">
            <UserInfoCard
              name={user.name ?? ''}
              email={user.email}
              job={''}
              loginProvider={'소셜'}
              profileImageUrl={user.image ?? ''}
              projectCount={0}
              feedbackCount={0}
            />
            <SideNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />
          </div>

          {/* 오른쪽 컬럼 */}
          {activeMenu === 'profile' && (
            <ProfileForm
              initialName={user.name ?? ''}
              initialJob={''}
              initialSkills={[]}
              initialLinks={[]}
              initialBio={''}
            />
          )}
          {activeMenu === 'account' && <AccountForm email={user.email} />}
        </div>
      </div>
    </main>
  )
}
