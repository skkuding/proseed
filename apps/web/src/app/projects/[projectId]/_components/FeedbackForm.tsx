'use client'

import { FieldBadge } from '@/components/FieldBadge'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Image from 'next/image'
import { Dot, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'
import { FeedbackSuccessModal } from '@/components/FeedbackSuccessModal'
import Editor from '@/components/mdxEditor/Editor'
import { ImageDeleteModal } from '@/components/ImageDeleteModal'
import { ChevronRightIcon } from 'lucide-react'
import {
  getUploadUrl,
  uploadToS3,
  getProjectVersions,
  getFeedbackQuestions,
  createFeedback,
  type FeedbackQuestionItemDto,
  type CreateFeedbackDto,
} from '@/lib/api'
import { JOB_TABS, RECORD_CATEGORY_TO_API, type JobTab } from '@/app/_utils/projectConstants'

const ONE_LINE_MAX = 200
const MAX_IMAGES = 8
const TABS = JOB_TABS
type TabLabel = JobTab

type ImageItem = {
  id: string
  preview: string
  key?: string
  uploading: boolean
}

type ImageModal = { questionId: number; index: number } | null

export function CreateFeedbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const projectId = params.projectId as string
  const version = searchParams.get('version')
  const rolesParam = searchParams.get('roles')
  const allowedCategories = rolesParam ? rolesParam.split(',') : null

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

  const isLatestVersion = latestVersionId !== null && version === latestVersionId

  const [activeTab, setActiveTab] = useState<TabLabel>(allowedTabs[0] ?? '기획')
  const [oneLineReview, setOneLineReview] = useState('')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [questionImages, setQuestionImages] = useState<Record<number, ImageItem[]>>({})
  const [imageModal, setImageModal] = useState<ImageModal>(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const category = RECORD_CATEGORY_TO_API[activeTab]
  const questions = allQuestions
    .filter((q) => q.category === category)
    .sort((a, b) => a.order - b.order)

  const allowedApiCategories = new Set(allowedTabs.map((t) => RECORD_CATEGORY_TO_API[t]))
  const visibleQuestions = allQuestions.filter((q) => allowedApiCategories.has(q.category))
  const hasMissingRequired = visibleQuestions.some(
    (q) => q.required && (answers[q.id] ?? '').trim().length === 0
  )
  const isSubmitEnabled = oneLineReview.trim().length > 0 && !hasMissingRequired

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
    if (versionChecked && !isLatestVersion) {
      router.replace(`/projects/${params.projectId}/feedback`)
    }
  }, [versionChecked, isLatestVersion, router, params.projectId])

  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setShowLeaveModal(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (!versionChecked || !isLatestVersion) return null

  const handleLeaveConfirm = () => {
    window.history.go(-2)
  }

  const handleSubmit = async () => {
    if (!isSubmitEnabled) return

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

    setSubmitting(true)
    try {
      await createFeedback(projectId, version as string, dto)
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

  const handleImageSelect = async (questionId: number, files: FileList | null) => {
    if (!files || files.length === 0) return

    const current = questionImages[questionId]?.length ?? 0
    const remaining = MAX_IMAGES - current
    const selected = Array.from(files).slice(0, remaining)
    if (selected.length === 0) return

    const newImages: ImageItem[] = selected.map((file) => ({
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      uploading: true,
    }))

    setQuestionImages((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] ?? []), ...newImages],
    }))

    await Promise.all(
      selected.map(async (file, i) => {
        const imageId = newImages[i].id
        try {
          const { url, key } = await getUploadUrl(file.name, file.type)
          await uploadToS3(url, file)
          setQuestionImages((prev) => ({
            ...prev,
            [questionId]: prev[questionId].map((img) =>
              img.id === imageId ? { ...img, key, uploading: false } : img
            ),
          }))
        } catch {
          setQuestionImages((prev) => ({
            ...prev,
            [questionId]: prev[questionId].map((img) =>
              img.id === imageId ? { ...img, uploading: false } : img
            ),
          }))
        }
      })
    )

    const input = fileInputRefs.current[questionId]
    if (input) input.value = ''
  }

  const removeImage = (questionId: number, index: number) => {
    setQuestionImages((prev) => {
      const updated = prev[questionId].filter((_, i) => i !== index)
      return { ...prev, [questionId]: updated }
    })
    setImageModal(null)
  }

  const modalImages = imageModal ? (questionImages[imageModal.questionId] ?? []) : []
  const modalImage = imageModal ? modalImages[imageModal.index] : null

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
            <div
              key={q.id}
              ref={(el) => {
                questionRefs.current[q.id] = el
              }}
              className="flex flex-col gap-3 bg-white rounded-[12px] p-7 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-title1_sb_28 min-w-0 flex-1">{q.title}</h2>
                {q.required && <FieldBadge type="필수" />}
                <Button
                  size="sm"
                  onClick={() => fileInputRefs.current[q.id]?.click()}
                  disabled={(questionImages[q.id]?.length ?? 0) >= MAX_IMAGES}
                  className="w-34.25 shrink-0 px-5 text-sub3_sb_16"
                >
                  이미지 등록하기
                </Button>
                <input
                  ref={(el) => {
                    fileInputRefs.current[q.id] = el
                  }}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageSelect(q.id, e.target.files)}
                />
              </div>
              <Editor
                markdown={answers[q.id] ?? ''}
                onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                width="100%"
                height={252}
              />
              {/* Image area */}
              {(questionImages[q.id]?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                  {questionImages[q.id].map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setImageModal({ questionId: q.id, index })}
                      className="relative aspect-video w-full rounded-lg overflow-hidden hover:cursor-pointer"
                    >
                      <Image src={img.preview} alt="" fill className="object-cover" />
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRefs.current[q.id]?.click()}
                  className="flex flex-col items-center justify-center gap-2 w-56.25 h-31.75 rounded-xl border border-dashed border-neutral-200 text-CoolNeutral-50 bg-neutral-99 hover:bg-neutral-95 hover:cursor-pointer transition-colors"
                >
                  <ImageIcon className="size-6" />
                  <span className="text-caption1_m_13">이미지 등록</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="sticky top-6">
          <div className="w-90 shrink-0 flex flex-col gap-5 truncate bg-white rounded-[12px] p-7 shadow-[0_4px_20px_0_rgba(27, 29, 38, 0.06)]">
            <p className="text-title1_sb_28">피드백 답변 바로가기</p>
            <div className="flex flex-col gap-3">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => scrollToQuestion(q.id)}
                  className="flex items-center justify-between w-full rounded-lg text-body2_m_14 text-CoolNeutral-20 hover:bg-neutral-99 hover:cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center gap-0.5 min-w-0">
                    <Dot className="size-6 shrink-0 text-CoolNeutral-20" />
                    <span className="truncate text-body1_m_16">{q.title}</span>
                  </div>
                  <ChevronRightIcon className="size-5 shrink-0 text-CoolNeutral-40" />
                </button>
              ))}
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSubmit}
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
