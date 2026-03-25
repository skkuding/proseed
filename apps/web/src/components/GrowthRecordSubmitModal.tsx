'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useGrowthRecordStore } from '@/store/growthRecordStore'

const MAX_LENGTH = 600

interface GrowthRecordSubmitModalProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: () => void
  formData: {
    version: { major: string; minor: string; patch: string }
    imagesByTab: Record<string, string[]>
    answers: Record<number, string>
    taggedFeedbacks: Record<string, number[]>
  }
}

export function GrowthRecordSubmitModal({
  isOpen,
  onCancel,
  onSubmit,
  formData,
}: GrowthRecordSubmitModalProps) {
  const {
    setVersion,
    setImagesByTab,
    setAnswers,
    setTaggedFeedbacks,
    setUpdateGoal,
    setUpdateResult,
  } = useGrowthRecordStore()

  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const [goal, setGoal] = useState('')
  const [result, setResult] = useState('')

  if (!isOpen) return null

  const isSubmitEnabled = goal.trim().length > 0 && result.trim().length > 0

  const handleSubmit = () => {
    setVersion(formData.version)
    setImagesByTab(formData.imagesByTab)
    setAnswers(formData.answers)
    setTaggedFeedbacks(formData.taggedFeedbacks)
    setUpdateGoal(goal)
    setUpdateResult(result)
    onSubmit()
    router.push(`/projects/${projectId}/growthrecord/feedback-questions`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-[1020px] h-[709px] bg-background-normal rounded-2xl p-10 flex flex-col gap-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-head3_sb_36">성장기록을 등록하시겠습니까?</h2>
            <p className="text-body1_m_16 text-CoolNeutral-40">
              성장기록을 등록하기 전, 성장기록을 한 눈에 알아볼 수 있도록 업데이트 목표와 결과물을
              작성해주세요.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onCancel}
              className="h-12 px-5 rounded-lg border border-CoolNeutral-50 text-sub3_sb_16 text-CoolNeutral-20 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
            >
              취소하기
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isSubmitEnabled}
              className={`h-12 px-5 rounded-lg text-sub3_sb_16 transition-colors ${
                isSubmitEnabled
                  ? 'bg-neutral-20 text-white hover:bg-neutral-30 cursor-pointer'
                  : 'bg-neutral-200 text-CoolNeutral-50 cursor-not-allowed'
              }`}
            >
              성장기록 등록하기
            </button>
          </div>
        </div>

        {/* Textareas */}
        <div className="flex flex-col gap-2">
          {/* 이번 업데이트 목표 */}
          <div className="flex flex-col gap-2 bg-white rounded-xl p-5">
            <h3 className="text-title5_sb_20">이번 업데이트 목표</h3>
            <div className="relative">
              <textarea
                value={goal}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LENGTH) setGoal(e.target.value)
                }}
                placeholder="이번 업데이트의 목표를 작성해주세요"
                className="w-full h-44 resize-none rounded-xl border border-neutral-200 p-4 text-body2_m_14 text-CoolNeutral-20 placeholder:text-CoolNeutral-60 focus:outline-none focus:border-CoolNeutral-40 transition-colors"
              />
              <span className="absolute bottom-3 right-4 text-caption1_m_13 text-CoolNeutral-50">
                {goal.length}/{MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* 이번 업데이트 결과물 */}
          <div className="flex flex-col gap-2 bg-white rounded-xl p-5">
            <h3 className="text-title5_sb_20">이번 업데이트 결과물</h3>
            <div className="relative">
              <textarea
                value={result}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LENGTH) setResult(e.target.value)
                }}
                placeholder="이번 업데이트의 결과물을 작성해주세요"
                className="w-full h-44 resize-none rounded-xl border border-neutral-200 p-4 text-body2_m_14 text-CoolNeutral-20 placeholder:text-CoolNeutral-60 focus:outline-none focus:border-CoolNeutral-40 transition-colors"
              />
              <span className="absolute bottom-3 right-4 text-caption1_m_13 text-CoolNeutral-50">
                {result.length}/{MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
