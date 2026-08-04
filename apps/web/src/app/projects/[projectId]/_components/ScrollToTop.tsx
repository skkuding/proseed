'use client'

import { useLayoutEffect } from 'react'
import { useParams } from 'next/navigation'

// Next App Router가 세그먼트 마운트 시 내부적으로 실행하는 focus/scroll 복원 로직
// (layout-router의 ScrollAndFocusHandler.componentDidMount)이 이 컴포넌트의 useLayoutEffect
// "다음"에 실행되면서 layout.tsx 루트 div에 scrollIntoView를 걸어 우리가 0으로 되돌린 스크롤을
// 다시 덮어써버린다 — 그래서 진입 시 히어로 이미지가 아니라 성장기록 부근으로 스크롤된 채
// 렌더링되는 문제가 있었다. 같은 커밋 단계(useLayoutEffect/componentDidMount) 안에서는 순서를
// 이길 수 없으니, requestAnimationFrame으로 한 프레임 미뤄 Next의 처리가 끝난 뒤에 덮어쓴다.
export function ScrollToTop() {
  const params = useParams()
  const projectId = params.projectId as string

  useLayoutEffect(() => {
    // 해시가 있는 진입(예: #growth-record)은 다른 곳에서 해당 위치로 스크롤을 처리하므로 건드리지 않는다.
    if (window.location.hash) return
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0))
    return () => cancelAnimationFrame(raf)
  }, [projectId])

  return null
}
