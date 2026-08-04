'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { FeedbackTemplateModal } from '@/components/FeedbackTemplateModal'
import { GrowthRecordSubmitModal } from '@/components/GrowthRecordSubmitModal'
import { GrowthRecordSuccessModal } from '@/components/GrowthRecordSuccessModal'
import { ConfirmModal } from '@/components/ConfirmModal'
import { toast } from 'sonner'
import { useGrowthRecordStore } from '@/store/growthRecordStore'
import { useFeedbackTagStore } from '@/store/feedbackTagStore'
import {
  publishVersion,
  getProjectById,
  getDrafts,
  upsertDraft,
  type RecordCategory,
} from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import {
  JOB_TABS,
  JOB_API_TO_LABEL,
  RECORD_CATEGORY_TO_API,
  RECORD_CATEGORY_LABELS,
  jobTabToPersonLabel,
} from '@/app/_utils/projectConstants'
import { authClient } from '@/lib/auth-client'
import { FeedbackQuestionCard } from './FeedbackQuestionCard'
import {
  buildGrowthRecordPublishPayload,
  FREE_COMMENT_CONTENT,
  type FeedbackQuestionDraft,
  type TabLabel,
} from '../_utils/buildGrowthRecordPublishPayload'

const AUTOSAVE_DELAY_MS = 1000

const TABS = JOB_TABS

const MAX_QUESTIONS = 4 // 자유롭게 하고 싶은 말을 남겨주세요 포함

type Question = FeedbackQuestionDraft

// growthRecordDraft.content에 함께 저장되는 이 폼의 몫 — answers/imageKeys(GrowthRecordForm 소유)는
// 불러온 그대로 보존해서 저장 시 덮어쓰지 않는다
type DraftFeedbackQuestion = { content: string; isRequired: boolean; isFreeComment: boolean }
type DraftContent = {
  answers?: Record<string, string>
  imageKeys?: string[]
  feedbackQuestions?: DraftFeedbackQuestion[]
}

function questionsToDefault(): Question[] {
  return [createQuestion(), createFreeComment()]
}

function createQuestion(): Question {
  return { id: crypto.randomUUID(), text: '', isRequired: false, isFreeComment: false }
}

function createFreeComment(): Question {
  return { id: 'free-comment', text: '', isRequired: false, isFreeComment: true }
}

export function FeedbackQuestionsForm() {
  const [activeTab, setActiveTab] = useState<TabLabel>('기획')
  const [questionsByTab, setQuestionsByTab] = useState<Record<TabLabel, Question[]>>({
    기획: questionsToDefault(),
    디자인: questionsToDefault(),
    개발: questionsToDefault(),
    기타: questionsToDefault(),
  })
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isLead, setIsLead] = useState(false)
  const [allowedTabs, setAllowedTabs] = useState<TabLabel[] | null>(null)
  const [showLeadOnlyModal, setShowLeadOnlyModal] = useState(false)
  const [draftsReady, setDraftsReady] = useState(false)
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const { data: session, isPending: sessionPending } = authClient.useSession()
  // GrowthRecordForm이 같은 draft에 저장한 answers/imageKeys — 자동저장 시 덮어쓰지 않도록 보존
  const preservedContentByTab = useRef<Partial<Record<TabLabel, DraftContent>>>({})
  // 최초 1회만 기본 탭을 선택 — 브라우저 탭 전환 등으로 세션이 재검증돼 아래 effect가 다시 돌아도
  // 사용자가 고른 탭을 덮어쓰지 않기 위함
  const hasSetInitialTabRef = useRef(false)

  // 팀원은 자기 직군 질문만 작성 가능 — 발행은 리드만 가능하고, "프로젝트 업데이트" 클릭 시에만 안내
  useEffect(() => {
    if (sessionPending) return

    getProjectById(projectId)
      .then((project) => {
        const lead = !!session && Number(session.user.id) === project.createdById
        const tabs = lead
          ? [...JOB_TABS]
          : project.myJobType
            ? [JOB_API_TO_LABEL[project.myJobType]]
            : []
        setIsLead(lead)
        setAllowedTabs(tabs)
        if (!hasSetInitialTabRef.current && tabs.length > 0) {
          setActiveTab(tabs[0])
          hasSetInitialTabRef.current = true
        }
      })
      .catch(() => {
        setIsLead(false)
        setAllowedTabs([])
      })
  }, [projectId, session, sessionPending])

  // 직군별 공유 draft에서 이전에 작성된 질문을 불러옴 (리드는 전 직군, 팀원은 자기 직군만)
  useEffect(() => {
    if (allowedTabs === null) return

    getDrafts(projectId)
      .then((drafts) => {
        const loaded: Partial<Record<TabLabel, Question[]>> = {}
        for (const draft of drafts) {
          const tab = RECORD_CATEGORY_LABELS[draft.category] as TabLabel
          const content = draft.content as DraftContent
          preservedContentByTab.current[tab] = content
          const saved = content.feedbackQuestions
          loaded[tab] =
            saved && saved.length > 0
              ? saved.map((q) => ({
                  id: q.isFreeComment ? 'free-comment' : crypto.randomUUID(),
                  text: q.isFreeComment ? '' : q.content,
                  isRequired: q.isRequired,
                  isFreeComment: q.isFreeComment,
                }))
              : questionsToDefault()
        }
        setQuestionsByTab((prev) => ({ ...prev, ...loaded }))
      })
      .catch(() => {
        toast.error('임시저장된 질문을 불러오지 못했습니다')
      })
      .finally(() => setDraftsReady(true))
  }, [projectId, allowedTabs])

  // 활성 직군 탭의 질문을 draft로 자동저장 (초기 로딩 완료 후에만)
  useEffect(() => {
    if (!draftsReady) return

    const timer = setTimeout(() => {
      const categoryApi = RECORD_CATEGORY_TO_API[activeTab] as RecordCategory
      const content: DraftContent = {
        ...preservedContentByTab.current[activeTab],
        feedbackQuestions: questionsByTab[activeTab].map((q) => ({
          content: q.isFreeComment ? FREE_COMMENT_CONTENT : q.text,
          isRequired: q.isRequired,
          isFreeComment: q.isFreeComment,
        })),
      }
      preservedContentByTab.current[activeTab] = content
      upsertDraft(projectId, categoryApi, content).catch(() => {
        toast.error('임시저장에 실패했습니다')
      })
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [projectId, activeTab, questionsByTab, draftsReady])

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
    <div className="flex flex-col gap-8 mt-10">
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
          disabledTabs={TABS.filter((t) => !(allowedTabs ?? []).includes(t))}
          getLabel={jobTabToPersonLabel}
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
                <FeedbackQuestionCard
                  key={q.id}
                  title={
                    q.isFreeComment ? '자유롭게 하고 싶은 말을 남겨주세요' : `피드백 질문 ${num}`
                  }
                  isFreeComment={q.isFreeComment}
                  text={q.text}
                  isRequired={q.isRequired}
                  canRemove={questions.length > 1}
                  onTextChange={(text) => updateText(q.id, text)}
                  onToggleRequired={() => toggleRequired(q.id)}
                  onRemove={() => removeQuestion(q.id)}
                />
              )
            })
          })()}
        </div>

        {/* Sidebar */}
        <div className="sticky top-6 flex flex-col gap-3 w-90 shrink-0">
          {/* 피드백 질문 템플릿 */}
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex flex-col gap-2 bg-white rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] hover:bg-neutral-99 hover:cursor-pointer transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <p className="text-title1_sb_28">피드백 질문 템플릿</p>
              <ChevronRightIcon className="size-5 text-CoolNeutral-40" />
            </div>
            <p className="text-body3_r_16 text-CoolNeutral-40">
              PROSEED의 피드백 질문 템플릿을 통해 손쉽게 각 직군별 피드백을 작성해보세요
            </p>
          </button>

          {/* 피드백 질문 섹션 추가하기 */}
          <Button
            variant="outline"
            size="sm"
            onClick={addQuestion}
            disabled={!canAdd}
            className="w-full text-sub3_sb_16"
          >
            피드백 질문 섹션 추가하기
          </Button>

          {/* 프로젝트 업데이트 */}
          <Button
            size="sm"
            className="w-full text-sub3_sb_16"
            onClick={() => {
              // 리드는 발행을 위해 4개 직군 전체가 필요하지만, 팀원은 자기 직군만 채우면 됨
              const tabsToCheck = isLead
                ? (Object.keys(questionsByTab) as TabLabel[])
                : (allowedTabs ?? [])
              const hasEmpty = tabsToCheck.some((tab) =>
                questionsByTab[tab].some((q) => !q.isFreeComment && q.text.trim().length === 0)
              )
              if (hasEmpty) {
                toast.error('모든 질문란을 채워주세요')
                return
              }

              if (!isLead) {
                setShowLeadOnlyModal(true)
                return
              }

              // 이번 업데이트 목표/결과물은 전체 요약에 한 번만 노출되는 값이라
              // 실제 발행자인 리드가 마지막에 입력
              setShowSubmitModal(true)
            }}
            disabled={isPublishing}
          >
            {isPublishing ? '업데이트 중...' : '프로젝트 업데이트'}
          </Button>
        </div>
      </div>

      <GrowthRecordSubmitModal
        isOpen={showSubmitModal}
        onCancel={() => setShowSubmitModal(false)}
        onConfirm={async (goal, result) => {
          setShowSubmitModal(false)

          const { version, imagesByTab, answers, taggedFeedbacks } = useGrowthRecordStore.getState()

          const payload = buildGrowthRecordPublishPayload({
            version,
            imagesByTab,
            answers,
            taggedFeedbacks,
            questionsByTab,
            goal,
            result,
          })

          setIsPublishing(true)
          try {
            await publishVersion(projectId, payload)
            trackEvent('growth_record_published', { version: payload.version })
            const adoptedCount = (payload.taggedFeedbacks ?? []).reduce(
              (count, tag) => count + tag.submissions.length,
              0
            )
            if (adoptedCount > 0) {
              trackEvent('feedback_adopted', { adopted_count: adoptedCount })
            }
            useFeedbackTagStore.getState().resetTaggedFeedbacks()
            useGrowthRecordStore.getState().reset()
            setShowSuccessModal(true)
          } catch (err) {
            toast.error(err instanceof Error ? err.message : '성장기록 발행에 실패했습니다')
          } finally {
            setIsPublishing(false)
          }
        }}
      />

      <GrowthRecordSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        projectId={projectId}
      />

      <FeedbackTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
      />

      <ConfirmModal
        isOpen={showLeadOnlyModal}
        title="리드만 발행할 수 있어요"
        description="지금까지 작성한 내용은 자동저장돼요."
        cancelLabel="돌아갈래요"
        confirmLabel="저장할래요"
        onCancel={() => setShowLeadOnlyModal(false)}
        onConfirm={() => {
          setShowLeadOnlyModal(false)
          router.replace(`/projects/${projectId}`)
        }}
      />
    </div>
  )
}
