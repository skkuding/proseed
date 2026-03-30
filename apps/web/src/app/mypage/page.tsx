'use client'

import { useState } from 'react'
import { ProfileForm } from './_components/ProfileForm'
import { AccountForm } from './_components/AccountForm'
import { UserInfoCard } from './_components/UserInfoCard'
import { SideNav } from './_components/SideNav'
import mockUser from '@/app/_mockdata/user/user-profile.json'

type MenuItem = 'profile' | 'account' | 'faq'

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('profile')

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
              name={mockUser.name}
              email={mockUser.email}
              job={mockUser.job}
              loginProvider={mockUser.loginProvider}
              profileImageUrl={mockUser.profileImageUrl}
              projectCount={mockUser.projectCount}
              feedbackCount={mockUser.feedbackCount}
            />
            <SideNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />
          </div>

          {/* 오른쪽 컬럼 */}
          {activeMenu === 'profile' && (
            <ProfileForm
              initialName={mockUser.name}
              initialJob={mockUser.job}
              initialSkills={mockUser.skills}
              initialLinks={mockUser.links}
              initialBio={mockUser.bio}
            />
          )}
          {activeMenu === 'account' && <AccountForm />}
        </div>
      </div>
    </main>
  )
}
