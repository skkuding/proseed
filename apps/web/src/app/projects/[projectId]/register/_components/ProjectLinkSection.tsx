import Image from 'next/image'

interface ProjectLinkSectionProps {
  value: string
  onChange: (v: string) => void
}

export function ProjectLinkSection({ value, onChange }: ProjectLinkSectionProps) {
  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-6">
      <div className="flex flex-col justify-start gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-title1_sb_28">프로젝트 관련 링크</h2>
          <span className="text-primary-strong text-caption1_m_16 bg-primary-light rounded-[4px] px-2 py-1">
            필수
          </span>
        </div>

        <p className="text-body3_r_16 text-CoolNeutral-30">
          프로젝트로 직결되는 링크 또는 관련 링크를 첨부해주세요
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-[8px] border border-neutral-95 px-4 py-3">
        <Image src="/link.svg" alt="link" width={24} height={24} className="shrink-0 " />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="프로젝트 링크를 입력해주세요"
          className="flex-1 text-body1_m_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none bg-transparent"
        />
      </div>
    </section>
  )
}
