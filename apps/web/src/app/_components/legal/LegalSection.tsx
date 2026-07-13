import type { ReactNode } from 'react'

interface LegalSectionProps {
  /** 조/장 제목 (예: "제1조 (목적)") */
  heading: string
  children: ReactNode
}

/** 법률 문서의 한 조항 블록. 제목 + 본문 타이포를 통일한다. */
export function LegalSection({ heading, children }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title5_sb_20 text-CoolNeutral-20">{heading}</h2>
      <div className="flex flex-col gap-3 text-body3_r_16 leading-relaxed text-CoolNeutral-30">
        {children}
      </div>
    </section>
  )
}
