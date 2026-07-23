'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'
import { FeedbackTemplateModal } from '@/components/FeedbackTemplateModal'
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
  type CreateVersionDto,
  type RecordCategory,
} from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import {
  JOB_TABS,
  JOB_API_TO_LABEL,
  RECORD_CATEGORY_TO_API,
  RECORD_CATEGORY_LABELS,
} from '@/app/_utils/projectConstants'
import growthRecordQuestions from '@/app/_mockdata/project-detail/project-growthrecordQuestion.json'
import { authClient } from '@/lib/auth-client'

const FREE_COMMENT_CONTENT = '자유롭게 하고 싶은 말을 남겨주세요'
const AUTOSAVE_DELAY_MS = 1000

const TABS = JOB_TABS
type TabLabel = (typeof TABS)[number]

const TAB_TO_MOCK_CATEGORY: Record<TabLabel, keyof typeof growthRecordQuestions.questions> = {
  기획: 'plan',
  디자인: 'design',
  개발: 'dev',
  기타: 'general',
}

const MAX_QUESTIONS = 4 // 자유롭게 하고 싶은 말을 남겨주세요 포함
const MAX_LENGTH = 200

type Question = {
  id: string
  text: string
  isRequired: boolean
  isFreeComment: boolean
}

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
  const [activeTab, setActiveTab] = useState<TabLabel>('기획')
  const [questionsByTab, setQuestionsByTab] = useState<Record<TabLabel, Question[]>>({
    기획: questionsToDefault(),
    디자인: questionsToDefault(),
    개발: questionsToDefault(),
    기타: questionsToDefault(),
  })
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
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
  // 발행 성공 후 성공 모달의 버튼으로 페이지를 벗어날 때는 이탈 확인 모달을 띄우지 않도록 막는 플래그
  const isNavigatingForwardRef = useRef(false)
  // 최초 1회만 기본 탭을 선택 — 브라우저 탭 전환 등으로 세션이 재검증돼 아래 effect가 다시 돌아도
  // 사용자가 고른 탭을 덮어쓰지 않기 위함
  const hasSetInitialTabRef = useRef(false)

  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      if (isNavigatingForwardRef.current) {
        isNavigatingForwardRef.current = false
        return
      }
      window.history.pushState(null, '', window.location.href)
      setShowLeaveModal(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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
                      <Button
                        size="xs"
                        onClick={() => removeQuestion(q.id)}
                        disabled={questions.length === 1}
                        className="px-4 text-sub4_sb_14"
                      >
                        삭제하기
                      </Button>
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
            onClick={async () => {
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

              const { version, imagesByTab, answers, updateGoal, updateResult, taggedFeedbacks } =
                useGrowthRecordStore.getState()

              const growthRecords: CreateVersionDto['growthRecords'] = JOB_TABS.map((tab) => ({
                category: RECORD_CATEGORY_TO_API[
                  tab
                ] as CreateVersionDto['growthRecords'][number]['category'],
                contents: growthRecordQuestions.questions[TAB_TO_MOCK_CATEGORY[tab]].map((q) => ({
                  title: q.questionTitle,
                  content: answers[q.questionId] ?? '',
                  isDefault: true,
                })),
                imageKeys: imagesByTab[tab] ?? [],
              }))

              const feedbackQuestions: CreateVersionDto['feedbackQuestions'] = JOB_TABS.flatMap(
                (tab) =>
                  questionsByTab[tab].map((q) => ({
                    category: RECORD_CATEGORY_TO_API[
                      tab
                    ] as CreateVersionDto['feedbackQuestions'][number]['category'],
                    content: q.isFreeComment ? FREE_COMMENT_CONTENT : q.text,
                    isRequired: q.isRequired,
                  }))
              )

              const taggedFeedbacksPayload: CreateVersionDto['taggedFeedbacks'] = Object.entries(
                taggedFeedbacks
              )
                .filter(([, entries]) => entries.length > 0)
                .map(([category, entries]) => ({
                  category: category as CreateVersionDto['feedbackQuestions'][number]['category'],
                  submissions: entries.map((entry) => ({
                    versionId: entry.versionId,
                    userId: entry.userId,
                  })),
                }))

              const payload: CreateVersionDto = {
                version: `${version.major}.${version.minor}.${version.patch}`,
                updateGoal,
                updateResults: [updateResult],
                growthRecords,
                feedbackQuestions,
                taggedFeedbacks: taggedFeedbacksPayload,
              }

              setIsPublishing(true)
              try {
                await publishVersion(projectId, payload)
                trackEvent('growth_record_published', { version: payload.version })
                const adoptedCount = taggedFeedbacksPayload.reduce(
                  (count, tag) => count + tag.submissions.length,
                  0
                )
                if (adoptedCount > 0) {
                  trackEvent('feedback_adopted', { adopted_count: adoptedCount })
                }
                useFeedbackTagStore.getState().resetTaggedFeedbacks()
                useGrowthRecordStore.getState().reset()
                isNavigatingForwardRef.current = true
                setShowSuccessModal(true)
              } catch (err) {
                toast.error(err instanceof Error ? err.message : '성장기록 발행에 실패했습니다')
              } finally {
                setIsPublishing(false)
              }
            }}
            disabled={isPublishing}
          >
            {isPublishing ? '업데이트 중...' : '프로젝트 업데이트'}
          </Button>
        </div>
      </div>

      <GrowthRecordSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        projectId={projectId}
      />

      <FeedbackTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
      />

      <LeaveConfirmModal
        isOpen={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => window.history.go(-2)}
      />

      <ConfirmModal
        isOpen={showLeadOnlyModal}
        title="리드만 발행할 수 있어요"
        description="지금까지 작성한 내용은 자동저장돼요."
        cancelLabel="돌아갈래요"
        confirmLabel="저장할래요"
        onCancel={() => setShowLeadOnlyModal(false)}
        onConfirm={() => {
          isNavigatingForwardRef.current = true
          setShowLeadOnlyModal(false)
          router.replace(`/projects/${projectId}`)
        }}
      />
    </div>
  )
}
