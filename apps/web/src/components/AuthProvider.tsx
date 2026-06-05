'use client'

import { useEffect, useRef } from 'react'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/authStore'
import { LoginModal } from '@/components/LoginModal'
import { OnboardingModal } from '@/components/OnboardingModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()
  const {
    isLoginModalOpen,
    isOnboardingModalOpen,
    onboardingNickname,
    closeLoginModal,
    closeOnboardingModal,
    openOnboardingModal,
  } = useAuthStore()

  const checkedSessionId = useRef<string | null>(null)

  useEffect(() => {
    if (isPending || !session) {
      checkedSessionId.current = null
      return
    }
    const sessionId = session.session.id
    if (checkedSessionId.current === sessionId) return
    checkedSessionId.current = sessionId

    fetch(`${API_URL}/user/check`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data: { isNewUser: boolean; nickname: string }) => {
        if (data.isNewUser) openOnboardingModal(data.nickname)
      })
      .catch(console.error)
  }, [isPending, session, openOnboardingModal])

  return (
    <>
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      {session && (
        <OnboardingModal
          isOpen={isOnboardingModalOpen}
          onClose={closeOnboardingModal}
          nickname={onboardingNickname}
        />
      )}
    </>
  )
}
