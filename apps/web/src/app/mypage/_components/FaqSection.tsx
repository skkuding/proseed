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
  {
    question: '프로젝트를 어떻게 등록하나요?',
    answer:
      'PROSEED 메인 화면에서 프로젝트 등록 버튼을 클릭하여 프로젝트를 생성할 수 있습니다.\n프로젝트명, 프로젝트 설명, 진행 기간, 직무 등의 정보를 입력한 후 등록을 완료하면 팀원을 초대하고 성장기록 및 피드백을 작성할 수 있습니다.',
  },
  {
    question: '성장기록이란 무엇인가요?',
    answer:
      '성장기록은 프로젝트를 진행하며 경험한 문제 해결 과정, 배운 점, 성과 등을 기록하는 기능입니다.\n프로젝트 기간 동안의 경험을 체계적으로 정리하여 자신의 성장 과정을 돌아보고, 추후 포트폴리오 및 커리어 관리에 활용할 수 있습니다.',
  },
  {
    question: '팀원을 추가하려면 어떻게 하나요?',
    answer:
      '프로젝트 상세 페이지의 팀원 관리 메뉴에서 팀원을 초대할 수 있습니다.\n프로젝트 리드가 등록된 회원을 검색하여 팀원으로 추가할 수 있으며, 팀원은 프로젝트 참여 후 해당 프로젝트의 일원으로 활동할 수 있습니다.',
  },
  {
    question: '계정을 삭제하면 어떻게 되나요?',
    answer:
      '계정을 삭제하면 등록한 프로젝트, 성장기록, 작성한 피드백 등 모든 정보가 삭제되며 복구할 수 없습니다.\n계정 삭제 전 필요한 데이터를 반드시 확인해 주세요.',
  },
  {
    question: '피드백은 누가 작성할 수 있나요?',
    answer:
      '프로젝트에 참여한 경험이 없더라도 피드백은 얼마든지 작성할 수 있습니다.\n프로젝트와 팀원들의 성장을 돕기 위해 객관적인 의견과 피드백을 많이 남겨주세요!',
  },
  {
    question: '직무를 변경할 수 있나요?',
    answer:
      '네, 마이페이지의 프로필 설정에서 언제든지 직무를 변경할 수 있습니다.\n변경된 직무 정보는 이후 등록하는 프로젝트와 프로필에 반영됩니다.',
  },
  {
    question: '프로젝트를 비공개로 설정할 수 있나요?',
    answer:
      '네, 프로젝트 등록 또는 수정 시 공개 범위를 설정할 수 있습니다.\n비공개로 설정된 프로젝트는 본인과 참여 팀원만 확인할 수 있으며, 외부 사용자에게는 노출되지 않습니다.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className="flex flex-col gap-5">
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
      <div className="flex items-center justify-between gap-4 rounded-[12px] bg-neutral-99 border border-neutral-95 p-5">
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
