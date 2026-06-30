'use client'

import { Suspense, useEffect, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserInfoCard } from './_components/UserInfoCard'
import { SideNav } from './_components/SideNav'
import { authClient } from '@/lib/auth-client'
import { MyPageProfileProvider, useMyPageProfile } from './_components/MyPageProfileContext'

const BETTER_AUTH_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')

type MenuItem = 'profile' | 'account' | 'faq'

function MyPageShell({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const { currentJob, provider, setProvider } = useMyPageProfile()

  const tabParam = searchParams.get('tab') as MenuItem | null
  const activeMenu: MenuItem =
    tabParam && (['profile', 'account', 'faq'] as MenuItem[]).includes(tabParam)
      ? tabParam
      : 'profile'

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/')
    }
  }, [isPending, session, router])

  useEffect(() => {
    if (!session) return
    fetch(`${BETTER_AUTH_BASE}/api/auth/list-accounts`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data: unknown) => {
        const accounts = Array.isArray(data) ? data : []
        const first = (accounts[0] as { providerId?: string })?.providerId
        if (first) setProvider(first)
      })
      .catch(() => {})
  }, [session, setProvider])

  if (isPending || !session) return null

  const handleMenuChange = (menu: MenuItem) => {
    router.push(`/mypage?tab=${menu}`, { scroll: false })
  }

  const currentUser = session.user

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
          <div className="flex w-100 min-w-[260px] shrink-0 flex-col gap-3">
            <UserInfoCard
              name={currentUser?.name ?? '테스트 유저'}
              email={currentUser?.email ?? 'test@example.com'}
              job={currentJob || '직무 미입력'}
              loginProvider={provider || 'local'}
              profileImageUrl={currentUser?.image ?? ''}
              projectCount={0}
              feedbackCount={0}
            />
            <SideNav activeMenu={activeMenu} onMenuChange={handleMenuChange} />
          </div>

          <div className="flex-1 min-w-0 w-235 rounded-[12px] bg-white px-9 py-10 shadow-[0_1px_3px_rgba(27,29,38,0.06)]">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <MyPageProfileProvider>
      <Suspense>
        <MyPageShell>{children}</MyPageShell>
      </Suspense>
    </MyPageProfileProvider>
  )
}
