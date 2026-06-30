'use client'

import { useSearchParams } from 'next/navigation'
import { ProfileForm } from './ProfileForm'
import { AccountForm } from './AccountForm'
import { FaqSection } from './FaqSection'
import { useMyPageProfile } from './MyPageProfileContext'

type MenuItem = 'profile' | 'account' | 'faq'

export default function MyPageContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as MenuItem | null
  const activeMenu: MenuItem =
    tabParam && (['profile', 'account', 'faq'] as MenuItem[]).includes(tabParam)
      ? tabParam
      : 'profile'
  const { currentJob, setCurrentJob, provider, user } = useMyPageProfile()

  return (
    <>
      {activeMenu === 'profile' && (
        <ProfileForm
          initialName={user.name}
          initialJob={currentJob}
          initialSkills={[]}
          initialLinks={[]}
          initialBio={''}
          onJobChange={setCurrentJob}
        />
      )}
      {activeMenu === 'account' && <AccountForm email={user.email} provider={provider} />}
      {activeMenu === 'faq' && <FaqSection />}
    </>
  )
}
