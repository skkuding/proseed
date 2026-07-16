'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/authStore'
import { LoginModal } from '@/components/LoginModal'
import { OnboardingModal } from '@/components/OnboardingModal'
import { PROFILE_SRCS } from '@/app/mypage/_components/ProfileImageModal'
import { BASE } from '@/lib/api'

function randomProfileSrc() {
  return PROFILE_SRCS[Math.floor(Math.random() * PROFILE_SRCS.length)]
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const {
    isLoginModalOpen,
    isOnboardingModalOpen,
    onboardingNickname,
    closeLoginModal,
    closeOnboardingModal,
    openOnboardingModal,
  } = useAuthStore()

  const checkedSessionId = useRef<string | null>(null)
  const wasLoggedIn = useRef(false)

  // 로그인 상태였다가 세션이 사라지면(로그아웃) 어느 페이지에 있든 홈으로 보낸다.
  useEffect(() => {
    if (isPending) return
    if (session) {
      wasLoggedIn.current = true
      return
    }
    if (wasLoggedIn.current) {
      wasLoggedIn.current = false
      router.push('/')
    }
  }, [isPending, session, router])

  useEffect(() => {
    if (isPending || !session) {
      checkedSessionId.current = null
      return
    }
    const sessionId = session.session.id
    if (checkedSessionId.current === sessionId) return
    checkedSessionId.current = sessionId

    fetch(`${BASE}/user/check`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data: { isNewUser: boolean; nickname: string }) => {
        if (data.isNewUser) {
          openOnboardingModal(data.nickname)
          authClient.updateUser({ image: randomProfileSrc() }).catch(console.error)
        }
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
