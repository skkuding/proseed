interface ContactPathSectionProps {
  value: string
  onChange: (v: string) => void
}

export function ContactPathSection({ value, onChange }: ContactPathSectionProps) {
  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-6">
      <div className="flex flex-col justify-start gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-title1_sb_28">연락 가능한 경로</h2>
          <span className="text-primary-strong text-caption1_m_16 bg-primary-light rounded-[4px] px-2 py-1">
            필수
          </span>
        </div>

        <p className="text-body3_r_16 text-CoolNeutral-30">
          프로젝트와 관련하여 연락을 받을 수 있는 연락처를 남겨주세요
        </p>
      </div>
      <div className="rounded-[8px] border border-neutral-95 px-4 py-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="오픈채팅 링크, 인스타그램 아이디 등을 기입해주세요"
          className="w-full text-body3_r_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none bg-transparent"
        />
      </div>
    </section>
  )
}
