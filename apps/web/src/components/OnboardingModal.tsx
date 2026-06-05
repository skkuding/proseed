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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[480px] rounded-3xl bg-white px-10 py-10">
        <h2 className="mb-8 text-title1_sb_28 text-CoolNeutral-20">
          맞춤형 정보를 드릴 수 있도록
          <br />
          아래 내용을 입력해주세요!
        </h2>

        <div className="flex flex-col gap-6">
          {/* 직무 유형 */}
          <div className="flex flex-col gap-2">
            <label className="text-sub3_sb_16 text-CoolNeutral-20">직무 유형</label>
            <Select value={jobType} onValueChange={(v) => setJobType(v as JobType)}>
              <SelectTrigger className="h-13 w-full rounded-xl border-neutral-90 text-body1_m_16">
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

          {/* 닉네임 */}
          <div className="flex flex-col gap-2">
            <label className="text-sub3_sb_16 text-CoolNeutral-20">닉네임</label>
            <div className="flex h-13 items-center justify-between rounded-xl border border-neutral-90 px-4">
              <span className="text-body1_m_16 text-CoolNeutral-20">{nickname}</span>
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

        <button
          onClick={handleSubmit}
          disabled={!jobType || isSubmitting}
          className="mt-8 h-13 w-full rounded-xl bg-CoolNeutral-20 text-sub3_sb_16 text-white transition-colors hover:cursor-pointer hover:bg-CoolNeutral-30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          PROSEED 시작하기
        </button>
      </div>
    </div>
  )
}
