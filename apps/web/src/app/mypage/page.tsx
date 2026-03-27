'use client'

import { useState } from 'react'
import { ChevronRight, User, Settings, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ProfileForm } from './_components/ProfileForm'
import { cn } from '@/lib/utils'

type MenuItem = 'profile' | 'account' | 'faq'

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('profile')

  return (
    <main className="min-h-screen px-8 py-12">
      {/* 페이지 헤더 */}
      <div className="mb-10">
        <h1 className="text-head3_sb_36 text-black">마이페이지</h1>
        <p className="mt-2 text-body4_r_14 text-neutral-60">
          프로필 정보 수정부터 계정 설정, 궁금한 점 해결까지 간편하게 확인하세요
        </p>
      </div>

      {/* 콘텐츠 */}
      <div className="flex items-start gap-6">
        {/* 왼쪽 컬럼 */}
        <div className="flex w-85 shrink-0 flex-col gap-4">
          {/* 유저 정보 카드 */}
          <div className="rounded-2xl bg-white p-6">
            <div className="flex items-center gap-4">
              <Image
                src="/mock/projectdetail/team-member1.png"
                alt="Profile Image"
                width={64}
                height={64}
                className="rounded-full bg-neutral-95"
              />
              <div>
                <p className="text-sub1_sb_18 text-neutral-10">영국의행복한친칠라</p>
                <p className="text-caption4_r_12 text-neutral-60">카카오 계정으로 로그인</p>
              </div>
            </div>

            <div className="my-5 h-px bg-CoolNeutral-95" />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-body4_r_14 text-neutral-60">이메일</span>
                <span className="text-body4_r_14 text-neutral-20">proseed@gmail.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body4_r_14 text-neutral-60">직무 유형</span>
                <span className="text-body4_r_14 text-neutral-20">디자이너</span>
              </div>
              <button className="flex w-full items-center justify-between transition-opacity hover:opacity-70">
                <span className="text-body4_r_14 text-neutral-60">참여 프로젝트</span>
                <div className="flex items-center gap-1">
                  <span className="text-body4_r_14 text-neutral-20">2개</span>
                  <ChevronRight className="size-4 text-neutral-40" />
                </div>
              </button>
              <button className="flex w-full items-center justify-between transition-opacity hover:opacity-70">
                <span className="text-body4_r_14 text-neutral-60">작성한 피드백</span>
                <div className="flex items-center gap-1">
                  <span className="text-body4_r_14 text-neutral-20">20개</span>
                  <ChevronRight className="size-4 text-neutral-40" />
                </div>
              </button>
            </div>

            <Button className="mt-6 h-12 w-full rounded-xl bg-neutral-10 text-white hover:bg-neutral-20">
              프로필 이미지 변경
            </Button>
          </div>

          {/* 네비게이션 메뉴 */}
          <div className="rounded-2xl bg-white p-2">
            <button
              onClick={() => setActiveMenu('profile')}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-CoolNeutral-99',
                activeMenu === 'profile' && 'bg-CoolNeutral-99'
              )}
            >
              <div className="flex items-center gap-3">
                <User className="size-5 text-neutral-40" />
                <span className="text-body2_m_14 text-neutral-20">내 프로필</span>
              </div>
              <ChevronRight className="size-4 text-neutral-40" />
            </button>
            <button
              onClick={() => setActiveMenu('account')}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-CoolNeutral-99',
                activeMenu === 'account' && 'bg-CoolNeutral-99'
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className="size-5 text-neutral-40" />
                <span className="text-body2_m_14 text-neutral-20">계정 관리</span>
              </div>
              <ChevronRight className="size-4 text-neutral-40" />
            </button>
            <button
              onClick={() => setActiveMenu('faq')}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-CoolNeutral-99',
                activeMenu === 'faq' && 'bg-CoolNeutral-99'
              )}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="size-5 text-neutral-40" />
                <span className="text-body2_m_14 text-neutral-20">FAQ · 고객센터</span>
              </div>
              <ChevronRight className="size-4 text-neutral-40" />
            </button>
          </div>
        </div>

        {/* 오른쪽 컬럼 */}
        {activeMenu === 'profile' && <ProfileForm />}
      </div>
    </main>
  )
}
