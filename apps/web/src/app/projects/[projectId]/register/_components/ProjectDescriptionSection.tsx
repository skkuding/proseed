interface ProjectDescriptionSectionProps {
  oneLineDescription: string
  description: string
  onChangeOneLine: (v: string) => void
  onChangeDesc: (v: string) => void
}

export function ProjectDescriptionSection({
  oneLineDescription,
  description,
  onChangeOneLine,
  onChangeDesc,
}: ProjectDescriptionSectionProps) {
  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-3">
      <div className="flex flex-col justify-start gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-title1_sb_28">프로젝트 설명</h2>
          <span className="text-primary-strong text-caption1_m_16 bg-primary-light rounded-[4px] px-2 py-1">
            필수
          </span>
        </div>
        <p className="text-body3_r_16 text-CoolNeutral-30">
          프로젝트 설명과 한 줄 소개를 최소 20자 이상 작성해주세요
        </p>
      </div>

      <div className="relative rounded-[8px] border border-neutral-95 px-4 py-3 mt-3">
        <input
          type="text"
          value={oneLineDescription}
          maxLength={100}
          onChange={(e) => onChangeOneLine(e.target.value)}
          placeholder="한 줄 소개를 입력해주세요"
          className="w-full text-body1_m_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none bg-transparent pr-16"
        />
        <span className="absolute right-4 top-3 text-body1_m_16 text-CoolNeutral-20">
          {oneLineDescription.length}/100
        </span>
      </div>
      <div className="relative rounded-[8px] border border-neutral-95 p-4 h-[170px]">
        <textarea
          value={description}
          maxLength={600}
          onChange={(e) => onChangeDesc(e.target.value)}
          placeholder="세부 설명을 입력해주세요"
          rows={6}
          className="w-full text-body1_m_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none bg-transparent resize-none"
        />
        <span className="absolute right-4 bottom-3 text-body1_m_16 text-CoolNeutral-20">
          {description.length}/600
        </span>
      </div>
    </section>
  )
}
