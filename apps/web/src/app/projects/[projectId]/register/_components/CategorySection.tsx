import Image from 'next/image'
import { categories } from '@/app/mainpage/_components/CategoryTabs'

interface CategorySectionProps {
  selected: string[]
  onToggle: (label: string) => void
}

export function CategorySection({ selected, onToggle }: CategorySectionProps) {
  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-6">
      <div className="flex flex-col justify-start gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-title1_sb_28">카테고리 설정</h2>
          <span className="text-primary-strong text-caption1_m_16 bg-primary-light rounded-[4px] px-2 py-1">
            필수
          </span>
        </div>

        <p className="text-body3_r_16 text-CoolNeutral-30">
          최대 2개의 카테고리를 선택할 수 있어요
        </p>
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-3">
        {categories
          .filter((c) => c.label !== '전체')
          .map((c) => {
            const isSelected = selected.includes(c.label)
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => onToggle(c.label)}
                className={`inline-flex items-center text-black bg-white gap-[6px] h-12 pl-3 py-[10px] pr-4 rounded-full text-title6_m_20 border-[1.4px] shadow-[0_4px_12px_0_rgba(27,29,38,0.06)] hover:cursor-pointer transition-colors ${
                  isSelected ? 'border-[#FF754F]' : 'border-transparent hover:border-[#FF754F]'
                }`}
              >
                {c.icon && <Image src={c.icon} alt={c.label} width={16} height={16} />}
                {c.label}
              </button>
            )
          })}
      </div>
    </section>
  )
}
