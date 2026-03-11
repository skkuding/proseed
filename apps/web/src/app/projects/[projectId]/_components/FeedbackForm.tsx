'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, Dot, ImageIcon, Trash2 } from 'lucide-react'
import versionList from '@/app/_mockdata/project-detail/project-version.json'
import feedbackQuestions from '@/app/_mockdata/project-detail/project-feedbackQuestion.json'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'
import Editor from '@/components/mdxEditor/Editor'

const latestVersionId = versionList[0].id.toString()
const ONE_LINE_MAX = 200
const MAX_IMAGES = 8
const TABS = ['기획자', '디자이너', '개발자', '기타'] as const
type TabLabel = (typeof TABS)[number]

const TAB_TO_CATEGORY: Record<TabLabel, keyof typeof feedbackQuestions.questions> = {
  기획자: 'plan',
  디자이너: 'design',
  개발자: 'dev',
  기타: 'general',
}

type ImageItem = {
  id: string
  previewUrl: string
  key?: string
  uploading: boolean
}

type ImageModal = { questionId: number; index: number } | null

async function getUploadUrl(filename: string, contentType: string) {
  const res = await fetch('http://localhost:4000/storage/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType }),
  })
  return res.json() as Promise<{ url: string; key: string }>
}

async function uploadToS3(presignedUrl: string, file: File) {
  await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
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
  const [questionImages, setQuestionImages] = useState<Record<number, ImageItem[]>>({})
  const [imageModal, setImageModal] = useState<ImageModal>(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const category = TAB_TO_CATEGORY[activeTab]
  const questions = feedbackQuestions.questions[category]

  useEffect(() => {
    if (!isLatestVersion) {
      router.replace(`/projects/${params.projectId}/feedback`)
    }
  }, [isLatestVersion, router, params.projectId])

  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setShowLeaveModal(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (!isLatestVersion) return null

  const handleLeaveConfirm = () => {
    window.history.go(-2)
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
      previewUrl: URL.createObjectURL(file),
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
    <div className="flex flex-col gap-8 mb-30">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
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

      {/* Body: main content + sidebar */}
      <div className="flex gap-6 items-start">
        {/* Main content */}
        <div className="flex-1 flex flex-col gap-5">
          {/* 한 줄 평가 */}
          <div className="flex flex-col gap-3 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <div className="flex items-center gap-2">
              <h2 className="text-title1_sb_28">피드백 한 줄 평가</h2>
              <span className="text-caption1_m_13 text-primary-strong bg-primary-light px-2 py-1 rounded-sm">
                필수
              </span>
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
              ref={(el) => {
                questionRefs.current[q.questionId] = el
              }}
              className="flex flex-col gap-3 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-title1_sb_28">{q.questionTitle}</h2>
                {q.isRequired && (
                  <span className="text-caption1_m_13 text-primary-strong bg-primary-light px-2 py-1 rounded-sm">
                    필수
                  </span>
                )}
                <button
                  onClick={() => fileInputRefs.current[q.questionId]?.click()}
                  disabled={(questionImages[q.questionId]?.length ?? 0) >= MAX_IMAGES}
                  className="ml-auto flex items-center gap-1.5 px-5 py-3.25 w-34.25 h-12 rounded-lg bg-neutral-20 hover:bg-neutral-30 hover:cursor-pointer transition-colors disabled:bg-neutral-90 disabled:cursor-not-allowed"
                >
                  <p className="text-sub3_sb_16 text-white">이미지 등록하기</p>
                </button>
                <input
                  ref={(el) => {
                    fileInputRefs.current[q.questionId] = el
                  }}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageSelect(q.questionId, e.target.files)}
                />
              </div>
              <Editor
                markdown={answers[q.questionId] ?? ''}
                onChange={(val) => setAnswers((prev) => ({ ...prev, [q.questionId]: val }))}
                width="100%"
                height={252}
              />
              {/* Image area */}
              {(questionImages[q.questionId]?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {questionImages[q.questionId].map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setImageModal({ questionId: q.questionId, index })}
                      className="relative w-56.25 h-31.75 shrink-0 rounded-lg overflow-hidden hover:cursor-pointer"
                    >
                      <Image src={img.previewUrl} alt="" fill className="object-cover" />
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
                  onClick={() => fileInputRefs.current[q.questionId]?.click()}
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
          <div className="w-90 shrink-0  flex flex-col gap-3 truncate bg-white rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <p className="text-title1_sb_28">바로가기</p>
            <div className="flex flex-col">
              {questions.map((q) => (
                <button
                  key={q.questionId}
                  onClick={() => scrollToQuestion(q.questionId)}
                  className="flex items-center justify-between w-full px-1 py-2 rounded-lg text-body2_m_14 text-CoolNeutral-20 hover:bg-neutral-99 hover:cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center gap-0.5 min-w-0">
                    <Dot className="size-4 shrink-0" />
                    <span className="truncate text-body1_m_16">{q.questionTitle}</span>
                  </div>
                  <ChevronRightIcon className="size-5 shrink-0 text-CoolNeutral-40" />
                </button>
              ))}
            </div>
          </div>
          <button className="w-full h-12 mt-4 bg-CoolNeutral-20 text-white rounded-lg text-sub3_sb_16 hover:bg-CoolNeutral-30 hover:cursor-pointer transition-colors">
            피드백 등록하기
          </button>
        </div>
      </div>

      <LeaveConfirmModal
        isOpen={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveConfirm}
      />

      {/* Image modal */}
      {imageModal && modalImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
          onClick={() => setImageModal(null)}
        >
          {/* Image + nav */}
          <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() =>
                setImageModal((prev) =>
                  prev
                    ? { ...prev, index: (prev.index - 1 + modalImages.length) % modalImages.length }
                    : null
                )
              }
              className="size-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 hover:cursor-pointer transition-colors"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
            <div className="relative w-175 h-100 rounded-2xl overflow-hidden">
              <Image src={modalImage.previewUrl} alt="" fill className="object-contain" />
            </div>
            <button
              onClick={() =>
                setImageModal((prev) =>
                  prev ? { ...prev, index: (prev.index + 1) % modalImages.length } : null
                )
              }
              className="size-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 hover:cursor-pointer transition-colors"
            >
              <ChevronRightIcon className="size-6" />
            </button>
          </div>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeImage(imageModal.questionId, imageModal.index)
            }}
            className="mt-4 flex w-225 justify-center h-13 items-center gap-2 px-6 py-3.5 bg-white rounded-lg text-CoolNeutral-20 text-sub3_sb_16 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
          >
            <Trash2 className="size-4" />
            이미지 삭제하기
          </button>
        </div>
      )}
    </div>
  )
}
