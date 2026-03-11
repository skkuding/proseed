'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import versionList from '@/app/_mockdata/project-detail/project-version.json'
import feedbackQuestions from '@/app/_mockdata/project-detail/project-feedbackQuestion.json'
import { RoleFilterTabs } from '@/components/RoleTabs'
import Editor from '@/components/mdxEditor/Editor'

const latestVersionId = versionList[0].id.toString()
const ONE_LINE_MAX = 200
const TABS = ['기획자', '디자이너', '개발자', '기타'] as const
type TabLabel = (typeof TABS)[number]

const TAB_TO_CATEGORY: Record<TabLabel, keyof typeof feedbackQuestions.questions> = {
  기획자: 'plan',
  디자이너: 'design',
  개발자: 'dev',
  기타: 'general',
}

export function CreateFeedbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const version = searchParams.get('version')

  const isLatestVersion = version === latestVersionId

  const [activeTab, setActiveTab] = useState<TabLabel>('기획자')
  const [oneLineReview, setOneLineReview] = useState('')
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const category = TAB_TO_CATEGORY[activeTab]
  const questions = feedbackQuestions.questions[category]

  useEffect(() => {
    if (!isLatestVersion) {
      router.replace(`/projects/${params.projectId}/feedback`)
    }
  }, [isLatestVersion, router, params.projectId])

  if (!isLatestVersion) return null

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-head3_sb_36">프로젝트 피드백 작성하기</h1>
          <p className="text-body3_r_16 text-CoolNeutral-40 mt-2">
            원하시는 직군의 피드백만 선택하여 작성할 수 있어요
          </p>
        </div>
        <RoleFilterTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabLabel)}
        />
      </div>

      <div className="flex flex-col gap-5">
        {/* 한 줄 평가 */}
        <div className="flex flex-col gap-3 border bg-white border-neutral-200 rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <h2 className="text-title3_sb_20">피드백 한 줄 평가</h2>
            <span className="text-caption1_m_13 text-primary-strong">필수</span>
          </div>
          <div className="relative">
            <textarea
              value={oneLineReview}
              onChange={(e) => {
                if (e.target.value.length <= ONE_LINE_MAX) setOneLineReview(e.target.value)
              }}
              placeholder="텍스트를 입력해주세요"
              className="w-full h-16.5 resize-none rounded-xl border border-neutral-200 px-5 py-4 text-body3_r_16 text-CoolNeutral-20 placeholder:text-CoolNeutral-50 focus:outline-none focus:border-CoolNeutral-40 transition-colors"
            />
            <span className="absolute bottom-3 right-4 text-caption1_m_13 text-CoolNeutral-50">
              {oneLineReview.length}/{ONE_LINE_MAX}
            </span>
          </div>
        </div>

        {/* 질문별 답변 */}
        {questions.map((q) => (
          <div
            key={q.questionId}
            className="flex flex-col gap-3 bg-white border border-neutral-200 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-title3_sb_20">{q.questionTitle}</h2>
              <span className="text-caption1_m_13 text-primary-strong">필수</span>
            </div>
            <Editor
              markdown={answers[q.questionId] ?? ''}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [q.questionId]: val }))}
              width="100%"
              height={200}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
