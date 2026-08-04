'use client'

import { useEffect, useRef } from 'react'
import { useLeaveGuardStore } from '@/store/leaveGuardStore'

// 브라우저 뒤로가기를 누르면 바로 페이지를 벗어나는 대신 이탈 확인 모달을 띄운다.
// 진입 시 더미 히스토리 엔트리를 하나 push해서 뒤로가기(popstate)를 가로채는 방식 —
// pushState는 멱등하지 않은데 dev 모드 StrictMode가 effect를 두 번 실행하므로,
// ref로 최초 1회만 push되도록 막지 않으면 더미가 2개 쌓여 history.go(-2) 계산이 어긋난다.
//
// 뒤로가기뿐 아니라 Header의 상단 탭 클릭·로그아웃처럼 이 훅의 마운트 범위 밖에서 일어나는
// 이탈 시도도 같은 확인 모달로 막아야 해서, isActive/pendingAction은 전역 store로 공유한다
// (activate 중엔 Header가 곧장 이동하는 대신 requestLeave로 이동 동작을 넘겨 모달을 띄우고,
// confirm 시 여기서 저장해둔 pendingAction이 실행된다).
export function useLeaveGuard() {
  const hasPushedDummyRef = useRef(false)
  const showLeaveModal = useLeaveGuardStore((s) => s.showModal)
  const activate = useLeaveGuardStore((s) => s.activate)
  const deactivate = useLeaveGuardStore((s) => s.deactivate)
  const requestLeave = useLeaveGuardStore((s) => s.requestLeave)
  const confirm = useLeaveGuardStore((s) => s.confirm)
  const cancel = useLeaveGuardStore((s) => s.cancel)

  useEffect(() => {
    activate()
    return () => deactivate()
  }, [activate, deactivate])

  useEffect(() => {
    if (!hasPushedDummyRef.current) {
      hasPushedDummyRef.current = true
      window.history.pushState(null, '', window.location.href)
    }

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      requestLeave(() => window.history.go(-2))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [requestLeave])

  return {
    showLeaveModal,
    setShowLeaveModal: (open: boolean) => {
      if (!open) cancel()
    },
    onLeaveConfirm: confirm,
  }
}
