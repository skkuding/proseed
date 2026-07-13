import type { ReactNode } from 'react'
import { TBD } from '@/app/_utils/legalInfo'

interface LegalDocumentProps {
  title: string
  /** 시행일. 미정이면 legalInfo의 TBD 마커가 그대로 노출된다. */
  effectiveDate: string
  children: ReactNode
}

/**
 * 개인정보처리방침·이용약관 공통 문서 래퍼.
 * 검토 전 초안 배너 + 제목 + 시행일 + prose 타이포를 통일한다.
 * 정적 서버 컴포넌트 (클라이언트 상태 없음, 크롤링 가능).
 */
export function LegalDocument({ title, effectiveDate, children }: LegalDocumentProps) {
  return (
    <main className="mx-auto w-full max-w-[840px] py-16">
      {/* ⚠️ 법률 전문가 검토 전 초안 — 게시 전 변호사 검토 및 미정값 확정 필요 (#73/#74) */}
      <div className="mb-10 rounded-lg border border-amber-300 bg-amber-50 px-5 py-4">
        <p className="text-body2_m_14 leading-relaxed text-amber-800">
          ⚠️ 법률 전문가 검토 전 초안입니다. 게시 전 변호사 검토와 미정 항목({TBD}) 확정이
          필요합니다.
        </p>
      </div>

      <h1 className="text-title1_sb_28 text-CoolNeutral-20">{title}</h1>
      <p className="mt-2 text-body4_r_14 text-CoolNeutral-50">시행일: {effectiveDate}</p>

      <div className="mt-10 flex flex-col gap-10">{children}</div>
    </main>
  )
}
