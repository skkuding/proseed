'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from './_components/ProfileForm'
import { AccountForm } from './_components/AccountForm'
import { FaqSection } from './_components/FaqSection'
import { UserInfoCard } from './_components/UserInfoCard'
import { SideNav } from './_components/SideNav'
import { authClient } from '@/lib/auth-client'

const BETTER_AUTH_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')

type MenuItem = 'profile' | 'account' | 'faq'

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('profile')
  const [provider, setProvider] = useState('')
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

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
  }, [session])

  if (isPending || !session) return null

  const user = session.user

  return (
    <div className="flex items-start gap-6">
      {/* 왼쪽 컬럼 */}
      <div className="flex w-100 min-w-[260px] shrink-0 flex-col gap-3">
        <UserInfoCard
          name={user.name ?? ''}
          email={user.email}
          job={''}
          loginProvider={provider}
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
      {activeMenu === 'account' && <AccountForm email={user.email} provider={provider} />}
      {activeMenu === 'faq' && <FaqSection />}
    </div>
  )
}
