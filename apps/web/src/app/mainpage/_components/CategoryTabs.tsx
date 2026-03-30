'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { categories, type CategoryLabel } from '@/app/_utils/projectConstants'

export { categories, type CategoryLabel }

interface CategoryTabsProps {
  selectedCategory: CategoryLabel
  onSelectCategory: (category: CategoryLabel) => void
}

export default function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })
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
        <Image src="/arrow2_right_grey.svg" alt="다음" width={24} height={24} />
      </button>
    </div>
  )
}
