'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const isDisabled = !jobType || isSubmitting

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                <Select value={jobType} onValueChange={(v) => setJobType(v as JobType)}>
                  <SelectTrigger
                    className={`h-[50px] w-full gap-2 rounded-[8px] border border-neutral-95 px-4 py-3 text-body1_m_16 ${jobType ? 'text-CoolNeutral-20' : 'text-neutral-80'}`}
                  >
                    <SelectValue placeholder="직무를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPE_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
