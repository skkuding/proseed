interface ProjectTypeSectionProps {
  value: 'APP' | 'WEB' | null
  onChange: (type: 'APP' | 'WEB') => void
}

export function ProjectTypeSection({ value, onChange }: ProjectTypeSectionProps) {
  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col justify-start gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-title1_sb_28">프로젝트 유형</h2>
            <span className="text-primary-strong text-caption1_m_16 bg-primary-light rounded-[4px] px-2 py-1">
              필수
            </span>
          </div>
          <p className="text-body3_r_16 text-CoolNeutral-30">
            등록하는 프로젝트의 유형을 알려주세요
          </p>
        </div>

        <div className="flex gap-1">
          {(['APP', 'WEB'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              className={`w-25 h-[50px] rounded-[8px] px-4 py-3 text-body1_m_16 transition-colors ${
                value === t
                  ? 'bg-CoolNeutral-15 text-white'
                  : 'bg-neutral-99 text-black hover:bg-neutral-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
