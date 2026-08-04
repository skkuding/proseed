'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

// 미들웨어가 로그인 필요한 경로를 막고 /?requireLogin=1 로 리다이렉트했을 때 로그인 모달을 띄운다
export function RequireLoginParamHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { openLoginModal } = useAuthStore()

  useEffect(() => {
    if (searchParams.get('requireLogin') !== '1') return
    openLoginModal()
    router.replace('/')
  }, [searchParams, openLoginModal, router])

  return null
}
