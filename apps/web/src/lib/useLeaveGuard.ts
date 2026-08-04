'use client'

import { useEffect, useRef, useState } from 'react'

// 브라우저 뒤로가기를 누르면 바로 페이지를 벗어나는 대신 이탈 확인 모달을 띄운다.
// 진입 시 더미 히스토리 엔트리를 하나 push해서 뒤로가기(popstate)를 가로채는 방식 —
// pushState는 멱등하지 않은데 dev 모드 StrictMode가 effect를 두 번 실행하므로,
// ref로 최초 1회만 push되도록 막지 않으면 더미가 2개 쌓여 history.go(-2) 계산이 어긋난다.
export function useLeaveGuard() {
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const hasPushedDummyRef = useRef(false)

  useEffect(() => {
    if (!hasPushedDummyRef.current) {
      hasPushedDummyRef.current = true
      window.history.pushState(null, '', window.location.href)
    }

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setShowLeaveModal(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return { showLeaveModal, setShowLeaveModal }
}
