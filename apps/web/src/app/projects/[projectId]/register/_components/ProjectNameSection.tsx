interface ProjectNameSectionProps {
  value: string
  onChange: (v: string) => void
}

export function ProjectNameSection({ value, onChange }: ProjectNameSectionProps) {
  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-6">
      <div className="flex flex-col justify-start gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-title1_sb_28">프로젝트명</h2>
          <span className="text-primary-strong text-caption1_m_16 bg-primary-light rounded-[4px] px-2 py-1">
            필수
          </span>
        </div>

        <p className="text-body3_r_16 text-CoolNeutral-30">최대 30자까지 기입할 수 있어요</p>
      </div>
      <div className="flex relative rounded-[8px] border border-neutral-95 px-4 py-3">
        <input
          type="text"
          value={value}
          maxLength={30}
          onChange={(e) => onChange(e.target.value)}
          placeholder="프로젝트명을 입력해주세요"
          className="w-full text-body1_m_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none bg-transparent"
        />

        <span className="absolute right-4 top-3 text-body1_m_16 text-CoolNeutral-20">
          {value.length}/30
        </span>
      </div>
    </section>
  )
}
