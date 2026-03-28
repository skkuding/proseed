'use client'

import Image from 'next/image'
import { useRef } from 'react'

export const categories = [
  { label: '전체', icon: undefined },
  { label: '헬스케어', icon: '/healthcare_color.svg' },
  { label: '금융', icon: '/money_color.svg' },
  { label: '공공 · 정부', icon: '/government_color.svg' },
  { label: '커머스', icon: '/commerce_color.svg' },
  { label: '교육', icon: '/education_color.svg' },
  { label: '엔터테인먼트', icon: '/entertainment_color.svg' },
  { label: '모빌리티', icon: '/mobility_color.svg' },
  { label: '에너지 · 환경', icon: '/energy_color.svg' },
  { label: '부동산 · 건설', icon: '/construction_color.svg' },
  { label: '라이프스타일', icon: '/lifestyle_color.svg' },
  { label: '생산성', icon: '/production_color.svg' },
  { label: '커뮤니티', icon: '/community_color.svg' },
  { label: '인공지능', icon: '/ai_color.svg' },
] as const

export type CategoryLabel = (typeof categories)[number]['label']

interface CategoryTabsProps {
  selectedCategory: CategoryLabel
  onSelectCategory: (category: CategoryLabel) => void
}

export default function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 240,
      behavior: 'smooth',
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div
        ref={scrollRef}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => {
          const isActive = category.label === selectedCategory

          return (
            <button
              key={category.label}
              type="button"
              onClick={() => onSelectCategory(category.label)}
              className={`inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full ${
                isActive
                  ? 'bg-CoolNeutral-30 text-white'
                  : 'bg-white text-CoolNeutral-20 hover:bg-CoolNeutral-90'
              }`}
            >
              <div
                className={`flex items-center gap-[6px] ${
                  category.label === '전체' ? 'px-6 py-[10px]' : 'py-[10px] pl-3 pr-4'
                }`}
              >
                {category.icon ? (
                  <Image
                    src={category.icon}
                    alt={category.label}
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0"
                  />
                ) : null}

                <span className="whitespace-nowrap text-title6_m_20">{category.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleScrollRight}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center cursor-pointer"
        aria-label="다음 카테고리 보기"
      >
        <Image src="/arrow2_right.svg" alt="다음" width={24} height={24} />
      </button>
    </div>
  )
}
