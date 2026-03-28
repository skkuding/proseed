import { STATUS_OPTIONS } from './constants'

interface ProjectStatusSectionProps {
  value: string | null
  onChange: (v: string) => void
}

export function ProjectStatusSection({ value, onChange }: ProjectStatusSectionProps) {
  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-6">
      <div className="flex flex-col justify-start gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-title1_sb_28">프로젝트 상태</h2>
          <span className="text-primary-strong text-caption1_m_16 bg-primary-light rounded-[4px] px-2 py-1">
            필수
          </span>
        </div>

        <p className="text-body3_r_16 text-CoolNeutral-30">
          등록하는 프로젝트의 주요 진행 상태를 알려주세요
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`h-[50px] px-4 py-3 rounded-[8px] text-body1_m_16 transition-colors ${
              value === s
                ? 'bg-CoolNeutral-15 text-white'
                : 'bg-neutral-99 text-black hover:bg-neutral-90'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  )
}
