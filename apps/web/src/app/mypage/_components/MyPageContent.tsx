'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProfileForm } from './ProfileForm'
import { AccountForm } from './AccountForm'
import { FaqSection } from './FaqSection'
import { UserInfoCard } from './UserInfoCard'
import { SideNav } from './SideNav'
import { authClient } from '@/lib/auth-client'

const BETTER_AUTH_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')

type MenuItem = 'profile' | 'account' | 'faq'

export default function MyPageContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as MenuItem | null
  const initialTab: MenuItem =
    tabParam && (['profile', 'account', 'faq'] as MenuItem[]).includes(tabParam)
      ? tabParam
      : 'profile'
  const [activeMenu, setActiveMenu] = useState<MenuItem>(initialTab)
  const [provider, setProvider] = useState('')
  const [currentJob, setCurrentJob] = useState('')
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
      <div className="flex w-100 min-w-[260px] shrink-0 flex-col gap-3">
        <UserInfoCard
          name={user.name ?? ''}
          email={user.email}
          job={currentJob}
          loginProvider={provider}
          profileImageUrl={user.image ?? ''}
          projectCount={0}
          feedbackCount={0}
        />
        <SideNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      </div>

      <div className="w-235 rounded-[12px] overflow-hidden">
        {activeMenu === 'profile' && (
          <ProfileForm
            initialName={user.name ?? ''}
            initialJob={currentJob}
            initialSkills={[]}
            initialLinks={[]}
            initialBio={''}
            onJobChange={setCurrentJob}
          />
        )}
        {activeMenu === 'account' && <AccountForm email={user.email} provider={provider} />}
        {activeMenu === 'faq' && <FaqSection />}
      </div>
    </div>
  )
}
