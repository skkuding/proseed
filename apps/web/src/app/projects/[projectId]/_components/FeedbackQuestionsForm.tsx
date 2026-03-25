'use client'

import { useEffect, useState } from 'react'
import { ChevronRightIcon } from 'lucide-react'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'

const TABS = ['기획자', '디자이너', '개발자', '기타'] as const
type TabLabel = (typeof TABS)[number]

const MAX_QUESTIONS = 4 // 자유롭게 하고 싶은 말을 남겨주세요 포함
const MAX_LENGTH = 200

type Question = {
  id: string
  text: string
  isRequired: boolean
  isFreeComment: boolean
}

function createQuestion(): Question {
  return { id: crypto.randomUUID(), text: '', isRequired: false, isFreeComment: false }
}

function createFreeComment(): Question {
  return { id: 'free-comment', text: '', isRequired: false, isFreeComment: true }
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors hover:cursor-pointer ${
        checked ? 'bg-primary-strong' : 'bg-neutral-200'
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function FeedbackQuestionsForm() {
  const [activeTab, setActiveTab] = useState<TabLabel>('기획자')
  const [questionsByTab, setQuestionsByTab] = useState<Record<TabLabel, Question[]>>({
    기획자: [createQuestion(), createFreeComment()],
    디자이너: [createQuestion(), createFreeComment()],
    개발자: [createQuestion(), createFreeComment()],
    기타: [createQuestion(), createFreeComment()],
  })
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setShowLeaveModal(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const questions = questionsByTab[activeTab]
  const canAdd = questions.length < MAX_QUESTIONS

  const updateQuestions = (updater: (prev: Question[]) => Question[]) => {
    setQuestionsByTab((prev) => ({ ...prev, [activeTab]: updater(prev[activeTab]) }))
  }

  const addQuestion = () => {
    if (!canAdd) return
    updateQuestions((prev) => {
      const lastIsFreeComment = prev[prev.length - 1]?.isFreeComment ?? false
      const insertAt = lastIsFreeComment ? prev.length - 1 : prev.length
      return [...prev.slice(0, insertAt), createQuestion(), ...prev.slice(insertAt)]
    })
  }

  const removeQuestion = (id: string) => {
    updateQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const updateText = (id: string, text: string) => {
    updateQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  const toggleRequired = (id: string) => {
    updateQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isRequired: !q.isRequired } : q))
    )
  }

  return (
    <div className="flex flex-col gap-8 mt-20 mb-30">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-head3_sb_36">프로젝트 피드백 질문</h1>
          <p className="text-body3_r_16 text-CoolNeutral-40 mt-2">
            업데이트된 프로젝트 성장기록을 바탕으로 피드백 받고 싶은 질문을 작성해보세요 (최대
            4개까지 작성 가능)
          </p>
        </div>
        <RoleFilterTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabLabel)}
        />
      </div>

      {/* Body */}
      <div className="flex gap-6 items-start">
        {/* Main content */}
        <div className="flex-1 flex flex-col gap-5">
          {(() => {
            let questionIndex = 0
            return questions.map((q) => {
              if (!q.isFreeComment) questionIndex++
              const num = questionIndex
              return (
                <div
                  key={q.id}
                  className="flex flex-col gap-3 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-title1_sb_28">
                      {q.isFreeComment
                        ? '자유롭게 하고 싶은 말을 남겨주세요'
                        : `피드백 질문 ${num}`}
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-body2_m_14 text-CoolNeutral-40">필수 질문</span>
                        <Toggle checked={q.isRequired} onChange={() => toggleRequired(q.id)} />
                      </div>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        disabled={questions.length === 1}
                        className="px-4 py-2 rounded-lg text-sub4_sb_14 text-white bg-CoolNeutral-20 hover:bg-CoolNeutral-30 hover:cursor-pointer transition-colors disabled:bg-neutral-200 disabled:text-CoolNeutral-50 disabled:cursor-not-allowed"
                      >
                        삭제하기
                      </button>
                    </div>
                  </div>
                  {!q.isFreeComment && (
                    <div className="relative">
                      <textarea
                        value={q.text}
                        onChange={(e) => {
                          if (e.target.value.length <= MAX_LENGTH) updateText(q.id, e.target.value)
                        }}
                        placeholder="텍스트를 입력해주세요"
                        className="w-full h-32 resize-none rounded-xl border border-neutral-200 p-4 text-body2_m_14 text-CoolNeutral-20 placeholder:text-CoolNeutral-60 focus:outline-none focus:border-CoolNeutral-40 transition-colors"
                      />
                      <span className="absolute bottom-3 right-4 text-caption1_m_13 text-CoolNeutral-50">
                        {q.text.length}/{MAX_LENGTH}
                      </span>
                    </div>
                  )}
                </div>
              )
            })
          })()}
        </div>

        {/* Sidebar */}
        <div className="sticky top-6 flex flex-col gap-3 w-90 shrink-0">
          {/* 피드백 질문 템플릿 */}
          <button className="flex flex-col gap-2 bg-white rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] hover:bg-neutral-99 hover:cursor-pointer transition-colors text-left">
            <div className="flex items-center justify-between">
              <p className="text-title1_sb_28">피드백 질문 템플릿</p>
              <ChevronRightIcon className="size-5 text-CoolNeutral-40" />
            </div>
            <p className="text-body3_r_16 text-CoolNeutral-40">
              PROSEED의 피드백 질문 템플릿을 통해 손쉽게 각 직군별 피드백을 작성해보세요
            </p>
          </button>

          {/* 피드백 질문 섹션 추가하기 */}
          <button
            onClick={addQuestion}
            disabled={!canAdd}
            className="w-full h-12 bg-white rounded-lg border-[1.4px] border-CoolNeutral-50 text-sub3_sb_16 text-CoolNeutral-20 hover:bg-neutral-95 hover:cursor-pointer transition-colors disabled:border-none disabled:bg-neutral-95 disabled:cursor-not-allowed disabled:text-neutral-70"
          >
            피드백 질문 섹션 추가하기
          </button>

          {/* 프로젝트 업데이트 */}
          <button className="w-full h-12 rounded-lg bg-CoolNeutral-20 text-sub3_sb_16 text-white hover:bg-CoolNeutral-30 hover:cursor-pointer transition-colors">
            프로젝트 업데이트
          </button>
        </div>
      </div>

      <LeaveConfirmModal
        isOpen={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => window.history.go(-2)}
      />
    </div>
  )
}
