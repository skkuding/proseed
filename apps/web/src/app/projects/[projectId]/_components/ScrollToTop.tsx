'use client'

import { useLayoutEffect } from 'react'
import { useParams } from 'next/navigation'

// Next의 기본 네비게이션 스크롤 복원이 이전 페이지의 스크롤 위치를 완전히
// 초기화하지 못해, 진입 시 히어로 이미지가 아니라 성장기록 부근으로
// 스크롤된 채 렌더링되는 문제를 막기 위해 프로젝트 진입 시 강제로 맨 위로 스크롤한다.
export function ScrollToTop() {
  const params = useParams()
  const projectId = params.projectId as string

  useLayoutEffect(() => {
    // 해시가 있는 진입(예: #growth-record)은 다른 곳에서 해당 위치로 스크롤을 처리하므로 건드리지 않는다.
    if (window.location.hash) return
    window.scrollTo(0, 0)
  }, [projectId])

  return null
}
