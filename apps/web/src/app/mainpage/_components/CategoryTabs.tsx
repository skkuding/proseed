'use client'

import Image from 'next/image'
import { useRef } from 'react'

const categories = [
  { label: '전체' },
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
]

export default function CategoryTabs() {
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
        {categories.map((category, index) => {
          const isActive = index === 0
          const isAll = category.label === '전체'

          return (
            <button
              key={category.label}
              className={`inline-flex h-12 shrink-0 items-center rounded-full ${
                isActive ? 'bg-CoolNeutral-30 text-white' : 'bg-white text-CoolNeutral-20'
              }`}
            >
              <div
                className={`flex items-center gap-[6px] ${
                  isAll ? 'px-6 py-[10px]' : 'py-[10px] pl-3 pr-4'
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

                <span className="whitespace-nowrap text-title_m_20">{category.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleScrollRight}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center"
        aria-label="다음 카테고리 보기"
      >
        <Image src="/arrow2_right.svg" alt="다음" width={24} height={24} />
      </button>
    </div>
  )
}
