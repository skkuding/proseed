'use client'

import { FieldBadge } from '@/components/FieldBadge'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'
import { useLeaveGuard } from '@/lib/useLeaveGuard'
import { ConfirmModal } from '@/components/ConfirmModal'
import { FeedbackSuccessModal } from '@/components/FeedbackSuccessModal'
import { ImageDeleteModal } from '@/components/ImageDeleteModal'
import { FeedbackQuestionBox } from './FeedbackQuestionBox'
import { FeedbackAnswerNavSidebar } from './FeedbackAnswerNavSidebar'
import { ProjectSummarySidebar } from './ProjectSummarySidebar'
import {
  getProjectVersions,
  getFeedbackQuestions,
  getProjectById,
  createFeedback,
  createFreeformFeedback,
  type FeedbackQuestionItemDto,
  type CreateFeedbackDto,
  type CreateFreeformFeedbackDto,
  type ProjectDetailResponseDto,
} from '@/lib/api'
import {
  JOB_TABS,
  RECORD_CATEGORY_TO_API,
  jobTabToPersonLabel,
  type JobTab,
} from '@/app/_utils/projectConstants'
import { trackEvent } from '@/lib/analytics'
import { useQuestionImages } from '../_hooks/useQuestionImages'

const ONE_LINE_MAX = 200
const TABS = JOB_TABS
type TabLabel = JobTab

// 성장기록(버전)이 아직 없는 프로젝트는 실제 질문 대신 직군당 자유 텍스트 질문 하나로 대체한다.
// FeedbackQuestionItemDto와 동일한 shape을 쓰면 기존 질문별 렌더링 코드를 그대로 재사용할 수 있다.
const FREEFORM_QUESTION_ID: Record<TabLabel, number> = {
  기획: -1,
  디자인: -2,
  개발: -3,
  기타: -4,
}
const FREEFORM_QUESTIONS: FeedbackQuestionItemDto[] = TABS.map((tab) => ({
  id: FREEFORM_QUESTION_ID[tab],
  category: RECORD_CATEGORY_TO_API[tab] as FeedbackQuestionItemDto['category'],
  title: '자유롭게 피드백을 남겨주세요',
  description: '',
  order: 0,
  required: true,
}))

export function CreateFeedbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const projectId = params.projectId as string
  const version = searchParams.get('version')
  const rolesParam = searchParams.get('roles')
  const allowedCategories = rolesParam ? rolesParam.split(',') : null
  // 성장기록(버전)이 아직 없는 프로젝트는 ?version 없이 이 페이지로 바로 들어온다
  const isFreeform = !version

  // GENERAL(기타) 필수 질문은 어떤 직군을 선택했든 항상 답변해야 하므로(백엔드 검증 기준)
  // 역할 선택에서 빠졌더라도 항상 탭에 포함시킨다
  const allowedTabs = allowedCategories
    ? (TABS.filter(
        (t) => allowedCategories.includes(RECORD_CATEGORY_TO_API[t]) || t === '기타'
      ) as TabLabel[])
    : ([...TABS] as TabLabel[])

  const [latestVersionId, setLatestVersionId] = useState<string | null>(null)
  const [versionChecked, setVersionChecked] = useState(false)
  const [allQuestions, setAllQuestions] = useState<FeedbackQuestionItemDto[]>([])
  const [project, setProject] = useState<ProjectDetailResponseDto | null>(null)

  const isLatestVersion = latestVersionId !== null && version === latestVersionId
  const effectiveQuestions = isFreeform ? FREEFORM_QUESTIONS : allQuestions

  const [activeTab, setActiveTab] = useState<TabLabel>(allowedTabs[0] ?? '기획')
  const [oneLineReview, setOneLineReview] = useState('')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const {
    questionImages,
    imageModal,
    setImageModal,
    handleImageSelect,
    removeImage,
    modalImages,
    modalImage,
  } = useQuestionImages()
  const { showLeaveModal, setShowLeaveModal } = useLeaveGuard()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFreeformConfirmModal, setShowFreeformConfirmModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const startTracked = useRef(false)
  useEffect(() => {
    if (startTracked.current) return
    startTracked.current = true
    trackEvent('feedback_started', {})
  }, [])

  const category = RECORD_CATEGORY_TO_API[activeTab]
  const questions = effectiveQuestions
    .filter((q) => q.category === category)
    .sort((a, b) => a.order - b.order)

  const allowedApiCategories = new Set(allowedTabs.map((t) => RECORD_CATEGORY_TO_API[t]))
  const visibleQuestions = effectiveQuestions.filter((q) => allowedApiCategories.has(q.category))
  const hasMissingRequired = visibleQuestions.some(
    (q) => q.required && (answers[q.id] ?? '').trim().length === 0
  )
  // 자유 피드백은 직군 중 하나만 작성해도 제출 가능 — "모든 필수 질문 충족"이 아니라 "하나 이상 작성"으로 판단
  const hasAnyFreeformAnswer = FREEFORM_QUESTIONS.some(
    (q) => (answers[q.id] ?? '').trim().length > 0
  )
  const isSubmitEnabled = isFreeform
    ? oneLineReview.trim().length > 0 && hasAnyFreeformAnswer
    : oneLineReview.trim().length > 0 && !hasMissingRequired

  useEffect(() => {
    if (!version) return
    getProjectVersions(projectId).then((versions) => {
      setLatestVersionId(versions[0] ? versions[0].id.toString() : null)
      setVersionChecked(true)
    })
    getFeedbackQuestions(projectId, version)
      .then(setAllQuestions)
      .catch(() => setAllQuestions([]))
  }, [projectId, version])

  useEffect(() => {
    if (isFreeform) return
    if (versionChecked && !isLatestVersion) {
      router.replace(`/projects/${params.projectId}/feedback`)
    }
  }, [isFreeform, versionChecked, isLatestVersion, router, params.projectId])

  useEffect(() => {
    if (!isFreeform) return
    getProjectById(projectId)
      .then(setProject)
      .catch(() => setProject(null))
  }, [isFreeform, projectId])

  if (!isFreeform && (!versionChecked || !isLatestVersion)) return null

  const handleLeaveConfirm = () => {
    window.history.go(-2)
  }

  const handleSubmit = async () => {
    if (!isSubmitEnabled) return

    setSubmitting(true)
    try {
      if (isFreeform) {
        const dto: CreateFreeformFeedbackDto = {
          oneLineReview,
          feedbacks: FREEFORM_QUESTIONS.filter((q) => (answers[q.id] ?? '').trim().length > 0).map(
            (q) => ({
              category: q.category as CreateFreeformFeedbackDto['feedbacks'][number]['category'],
              content: answers[q.id] ?? '',
              imageUrls: (questionImages[q.id] ?? [])
                .filter((img) => !img.uploading && img.key)
                .map((img) => img.key as string),
            })
          ),
        }
        await createFreeformFeedback(projectId, dto)
        trackEvent('feedback_submitted', { question_count: dto.feedbacks.length })
      } else {
        const dto: CreateFeedbackDto = {
          oneLineReview,
          // 백엔드가 content를 필수로 검증하므로, 선택 질문 중 답변 안 한 건 아예 빼고 보낸다
          feedbacks: visibleQuestions
            .filter((q) => (answers[q.id] ?? '').trim().length > 0)
            .map((q) => ({
              questionId: q.id,
              content: answers[q.id] ?? '',
              imageUrls: (questionImages[q.id] ?? [])
                .filter((img) => !img.uploading && img.key)
                .map((img) => img.key as string),
            })),
        }
        await createFeedback(projectId, version as string, dto)
        trackEvent('feedback_submitted', { question_count: visibleQuestions.length })
      }
      setShowSuccessModal(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '피드백 제출에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const scrollToQuestion = (questionId: number) => {
    questionRefs.current[questionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-10 mt-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-head0_sb_52">프로젝트 피드백 작성하기</h1>
          <p className="text-title6_m_20 text-CoolNeutral-40">
            원하시는 직군의 피드백만 선택하여 작성할 수 있어요
          </p>
        </div>
        <RoleFilterTabs
          tabs={TABS}
          disabledTabs={TABS.filter((t) => !allowedTabs.includes(t))}
          activeTab={activeTab}
          getLabel={jobTabToPersonLabel}
          onTabChange={(tab) => setActiveTab(tab as TabLabel)}
        />
      </div>

      {/* Body: main content + sidebar */}
      <div className="flex gap-5 items-start">
        {/* Main content */}
        <div className="flex-1 flex flex-col gap-5">
          {/* 한 줄 평가 */}
          <div className="flex flex-col gap-4 bg-white rounded-[12px] p-7 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <div className="flex items-center gap-2">
              <h2 className="text-title1_sb_28">피드백 한 줄 평가</h2>
              <FieldBadge type="필수" />
            </div>
            <div className="relative">
              <textarea
                value={oneLineReview}
                onChange={(e) => {
                  if (e.target.value.length <= ONE_LINE_MAX) setOneLineReview(e.target.value)
                }}
                placeholder="텍스트를 입력해주세요"
                className="w-full h-30 resize-none rounded-[8px] border border-neutral-95 p-4 pr-20 text-bod1_m_16 text-CoolNeutral-20 placeholder:text-CoolNeutral-50 focus:outline-none focus:border-CoolNeutral-40 transition-colors"
              />
              <span className="absolute bottom-4 right-4 text-body1_m_16 text-CoolNeutral-20">
                {oneLineReview.length}/{ONE_LINE_MAX}
              </span>
            </div>
          </div>

          {/* 질문별 답변 */}
          {questions.map((q) => (
            <FeedbackQuestionBox
              key={q.id}
              boxRef={(el) => {
                questionRefs.current[q.id] = el
              }}
              question={q}
              answer={answers[q.id] ?? ''}
              onAnswerChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
              images={questionImages[q.id] ?? []}
              onImageSelect={(files) => handleImageSelect(q.id, files)}
              onImageClick={(index) => setImageModal({ questionId: q.id, index })}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="sticky top-6">
          <div className="w-90 shrink-0 flex flex-col gap-5 truncate bg-white rounded-[12px] p-7 shadow-[0_4px_20px_0_rgba(27, 29, 38, 0.06)]">
            {isFreeform ? (
              <ProjectSummarySidebar project={project} />
            ) : (
              <FeedbackAnswerNavSidebar questions={questions} onScrollTo={scrollToQuestion} />
            )}
          </div>
          <Button
            size="sm"
            onClick={() => (isFreeform ? setShowFreeformConfirmModal(true) : handleSubmit())}
            disabled={submitting || !isSubmitEnabled}
            className="w-full mt-4 text-sub3_sb_16"
          >
            {submitting ? '등록 중...' : '피드백 등록하기'}
          </Button>
        </div>
      </div>

      <FeedbackSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        projectId={params.projectId ?? ''}
      />

      <ConfirmModal
        isOpen={showFreeformConfirmModal}
        title="피드백을 등록하시겠습니까?"
        description={
          <>
            피드백을 제출한 뒤에는 다시 수정하거나 작성하실 수 없습니다. <br />
            정말 피드백을 등록하시겠습니까?
          </>
        }
        cancelLabel="취소"
        confirmLabel="제출하기"
        onCancel={() => setShowFreeformConfirmModal(false)}
        onConfirm={() => {
          setShowFreeformConfirmModal(false)
          handleSubmit()
        }}
      />

      <LeaveConfirmModal
        isOpen={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveConfirm}
      />

      <ImageDeleteModal
        isOpen={!!imageModal && !!modalImage}
        images={modalImages}
        currentIndex={imageModal?.index ?? 0}
        onClose={() => setImageModal(null)}
        onPrev={() =>
          setImageModal((prev) =>
            prev
              ? { ...prev, index: (prev.index - 1 + modalImages.length) % modalImages.length }
              : null
          )
        }
        onNext={() =>
          setImageModal((prev) =>
            prev ? { ...prev, index: (prev.index + 1) % modalImages.length } : null
          )
        }
        onDelete={() => imageModal && removeImage(imageModal.questionId, imageModal.index)}
      />
    </div>
  )
}
