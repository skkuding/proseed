'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { RotateCcw } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type JobType = 'Planner' | 'Designer' | 'Developer' | 'Other'

const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'Planner', label: '기획자' },
  { value: 'Designer', label: '디자이너' },
  { value: 'Developer', label: '개발자' },
  { value: 'Other', label: '기타' },
]

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  nickname: string
}

export function OnboardingModal({
  isOpen,
  onClose,
  nickname: initialNickname,
}: OnboardingModalProps) {
  const [jobType, setJobType] = useState<JobType | ''>('')
  const [nickname, setNickname] = useState(initialNickname)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !initialNickname) {
      handleRegenerate()
    }
  }, [isOpen, initialNickname])

  useEffect(() => {
    setNickname(initialNickname)
  }, [initialNickname])

  if (!isOpen) return null

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const res = await fetch(`${API_URL}/user/nickname`, { credentials: 'include' })
      const data = await res.json()
      setNickname(data.nickname)
    } catch (e) {
      console.error(e)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!jobType) return
    setIsSubmitting(true)
    try {
      await fetch(`${API_URL}/user/onboarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jobType, nickname }),
      })
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedLabel = JOB_TYPE_OPTIONS.find((o) => o.value === jobType)?.label
  const isDisabled = !jobType || isSubmitting

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[20px]">
      {isDropdownOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
      )}
      <div className="w-[600px] rounded-[16px] bg-white px-7 py-10">
        {/* div7 */}
        <div className="flex flex-col gap-10">
          {/* div5 */}
          <div className="flex flex-col gap-7">
            {/* div1 */}
            <p className="text-title1_sb_28 text-black">
              맞춤형 정보를 드릴 수 있도록
              <br />
              아래 내용을 입력해주세요!
            </p>
            {/* div4 */}
            <div className="flex flex-col gap-7">
              {/* div2 - 직무 */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-sub4_sb_14 text-black">직무 유형</label>
                <div ref={dropdownRef} className="relative z-20">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex h-[50px] w-full items-center justify-between rounded-[8px] border border-neutral-95 px-4 py-3 text-body1_m_16 outline-none"
                  >
                    <span className={selectedLabel ? 'text-black' : 'text-neutral-80'}>
                      {selectedLabel ?? '직무를 선택해주세요'}
                    </span>
                    <Image
                      src="/arrow2_down.svg"
                      width={24}
                      height={24}
                      alt=""
                      className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute left-0 top-full w-full overflow-hidden rounded-[8px] border border-neutral-95 bg-white shadow-md">
                      {JOB_TYPE_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setJobType(value)
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full px-5 py-3 text-left text-body1_m_16 text-black transition-colors hover:bg-neutral-99 ${
                            jobType === value ? 'bg-neutral-99' : 'bg-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* div3 - 닉네임 */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-sub4_sb_14 text-black">닉네임</label>
                <div className="flex h-[50px] items-center gap-2 rounded-[8px] border border-neutral-95 px-4 py-3">
                  <span className="flex-1 text-body1_m_16 text-CoolNeutral-20">{nickname}</span>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="text-neutral-40 transition-colors hover:cursor-pointer hover:text-CoolNeutral-20 disabled:opacity-40"
                    aria-label="닉네임 재생성"
                  >
                    <RotateCcw className={`size-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* div6 */}
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`h-13 w-full rounded-[8px] px-5 py-[15px] text-sub3_sb_16 transition-colors hover:cursor-pointer ${
              isDisabled
                ? 'cursor-not-allowed bg-neutral-95 text-neutral-70'
                : 'bg-CoolNeutral-20 text-white hover:bg-CoolNeutral-30'
            }`}
          >
            PROSEED 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
