import type { ReactNode } from 'react'

interface LegalDocumentProps {
  title: string
  /** 시행일 (게시일) */
  effectiveDate: string
  children: ReactNode
}

/**
 * 개인정보처리방침·이용약관 공통 문서 래퍼.
 * 제목 + 시행일 + prose 타이포를 통일한다.
 * 정적 서버 컴포넌트 (클라이언트 상태 없음, 크롤링 가능).
 */
export function LegalDocument({ title, effectiveDate, children }: LegalDocumentProps) {
  return (
    <main className="mx-auto w-full max-w-[840px] py-16">
      <h1 className="text-title1_sb_28 text-CoolNeutral-20">{title}</h1>
      <p className="mt-2 text-body4_r_14 text-CoolNeutral-50">시행일: {effectiveDate}</p>

      <div className="mt-10 flex flex-col gap-10">{children}</div>
    </main>
  )
}
