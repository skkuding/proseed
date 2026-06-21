'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FAQ_ITEMS = [
  {
    question: 'PROSEED는 어떤 서비스인가요?',
    answer:
      'PROSEED는 IT 사이드 프로젝트들이 한 번 사용되고 버려지는 문제를 해결하기 위해, 업데이트 별로 피드백을 주고 받으며 성장하는 과정 그 자체를 커리어 자산이 될 수 있도록 도와주는 서비스입니다.\nPROSEED와 함께 사이드 프로젝트를 발전시키고 성장하여 IT 업계에 길이 남을 유능한 인재가 되어보세요!',
  },
  { question: '프로젝트를 어떻게 등록하나요?', answer: '' },
  { question: '성장기록이란 무엇인가요?', answer: '' },
  { question: '팀원을 추가하려면 어떻게 하나요?', answer: '' },
  { question: '계정을 삭제하면 어떻게 되나요?', answer: '' },
  { question: '피드백은 누가 작성할 수 있나요?', answer: '' },
  { question: '직무를 변경할 수 있나요?', answer: '' },
  { question: '프로젝트를 비공개로 설정할 수 있나요?', answer: '' },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className="flex-1 min-w-0 rounded-2xl bg-white px-9 py-10 flex flex-col gap-5">
      {/* div1 */}
      <h2 className="text-head3_sb_36 text-black">자주 묻는 질문</h2>

      {/* div2 */}
      <div className="flex flex-col">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index
          const isLast = index === FAQ_ITEMS.length - 1

          return (
            <div
              key={index}
              className={`flex flex-col ${!isLast ? 'border-b border-neutral-95' : ''}`}
            >
              {/* div4 — 질문 버튼 */}
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 py-5 pr-5 text-left hover:cursor-pointer"
              >
                <span className="flex items-center text-sub2_m_18 text-CoolNeutral-20">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                    <span className="h-[5px] w-[5px] rounded-full bg-CoolNeutral-40" />
                  </span>
                  {item.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="size-5 shrink-0 text-neutral-40" />
                ) : (
                  <ChevronDown className="size-5 shrink-0 text-neutral-40" />
                )}
              </button>

              {/* div5 — 답변*/}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  {item.answer && (
                    <div className="py-5 px-6 bg-neutral-99">
                      <p className="text-body1_m_16 text-CoolNeutral-20 whitespace-pre-line">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* div3 */}
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-neutral-99 border border-neutral-95 p-5">
        <div className="flex flex-col gap-1">
          <p className="text-title5_sb_20 text-black">추가적인 문의가 있으신가요?</p>
          <p className="text-body1_m_16 text-neutral-30">
            자주 묻는 질문에서 답을 찾지 못하셨다면 PROSEED에게 언제든지 문의해주세요
          </p>
        </div>
        <Button className="shrink-0 rounded-[8px] bg-CoolNeutral-20 px-5 py-[13px] text-sub3_sb_16 text-white hover:cursor-pointer h-12 w-[94px]">
          문의하기
        </Button>
      </div>
    </div>
  )
}
