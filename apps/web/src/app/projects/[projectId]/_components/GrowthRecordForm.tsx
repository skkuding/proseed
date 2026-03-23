'use client'

import { useEffect, useRef, useState } from 'react'
import { useFeedbackTagStore } from '@/store/feedbackTagStore'
import Image from 'next/image'
import { ChevronRightIcon, ImageIcon } from 'lucide-react'
import { RoleFilterTabs } from '@/components/RoleTabs'
import Editor from '@/components/mdxEditor/Editor'
import { ImageDeleteModal } from '@/components/ImageDeleteModal'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'
import { FeedbackTagModal } from '@/components/FeedbackTagModal'
import growthRecordQuestions from '@/app/_mockdata/project-detail/project-growthrecordQuestion.json'
import feedbackData from '@/app/_mockdata/project-detail/project-feedback.json'

const CATEGORY_LABEL: Record<string, string> = {
  plan: '기획자',
  design: '디자이너',
  dev: '개발자',
  general: '기타',
}

const TABS = ['기획자', '디자이너', '개발자', '기타'] as const
type TabLabel = (typeof TABS)[number]

const TAB_TO_CATEGORY: Record<TabLabel, keyof typeof growthRecordQuestions.questions> = {
  기획자: 'plan',
  디자이너: 'design',
  개발자: 'dev',
  기타: 'general',
}

type ImageItem = {
  id: string
  previewUrl: string
  uploading: boolean
}

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

export function GrowthRecordForm() {
  const [activeTab, setActiveTab] = useState<TabLabel>('기획자')
  const [version, setVersion] = useState({ major: '', minor: '', patch: '' })
  const [imagesByTab, setImagesByTab] = useState<Record<TabLabel, ImageItem[]>>({
    기획자: [],
    디자이너: [],
    개발자: [],
    기타: [],
  })
  const [imageModalIndex, setImageModalIndex] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showFeedbackTagModal, setShowFeedbackTagModal] = useState(false)
  const { taggedFeedbacks, removeTaggedFeedback } = useFeedbackTagStore()

  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setShowLeaveModal(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const category = TAB_TO_CATEGORY[activeTab]
  const questions = growthRecordQuestions.questions[category]
  const images = imagesByTab[activeTab]

  const setImages = (updater: (prev: ImageItem[]) => ImageItem[]) => {
    setImagesByTab((prev) => ({ ...prev, [activeTab]: updater(prev[activeTab]) }))
  }

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const selected = Array.from(files).slice(0, 8 - images.length)
    if (selected.length === 0) return

    const newImages: ImageItem[] = selected.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      uploading: true,
    }))

    setImages((prev) => [...prev, ...newImages])

    await Promise.all(
      selected.map(async (file, i) => {
        const imageId = newImages[i].id
        try {
          const { url } = await getUploadUrl(file.name, file.type)
          await uploadToS3(url, file)
          setImages((prev) =>
            prev.map((img) => (img.id === imageId ? { ...img, uploading: false } : img))
          )
        } catch {
          setImages((prev) =>
            prev.map((img) => (img.id === imageId ? { ...img, uploading: false } : img))
          )
        }
      })
    )

    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageModalIndex(null)
  }

  return (
    <div className="flex flex-col gap-8 mt-20 mb-30">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-head3_sb_36">프로젝트 성장기록 작성하기</h1>
          <p className="text-body3_r_16 text-CoolNeutral-40 mt-2">
            이번 업데이트 때 발전된 부분을 작성해보세요
          </p>
        </div>
        <RoleFilterTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab as TabLabel)
            setImageModalIndex(null)
          }}
        />
      </div>

      {/* Body: main content + sidebar */}
      <div className="flex gap-6 items-start">
        {/* Main content */}
        <div className="flex-1 flex flex-col gap-5">
          {/* 성장기록 버전 */}
          <div className="flex justify-between bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-title1_sb_28">성장기록 버전</h2>
                  <span className="text-caption1_m_13 text-primary-strong bg-primary-light px-2 py-1 rounded-sm">
                    필수
                  </span>
                </div>
              </div>
              <p className="text-body3_r_16 text-CoolNeutral-40">
                업데이트하는 성장기록의 버전을 입력해주세요
              </p>
            </div>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-title3_sb_20 text-CoolNeutral-40">v</span>
              <input
                type="number"
                min={0}
                value={version.major}
                onChange={(e) => setVersion((v) => ({ ...v, major: e.target.value }))}
                placeholder="0"
                className="w-[42px] h-[50px] text-center rounded-lg border border-neutral-200 text-title3_sb_20 focus:outline-none focus:border-CoolNeutral-40 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-title3_sb_20 text-CoolNeutral-40">.</span>
              <input
                type="number"
                min={0}
                value={version.minor}
                onChange={(e) => setVersion((v) => ({ ...v, minor: e.target.value }))}
                placeholder="0"
                className="w-[42px] h-[50px] text-center rounded-lg border border-neutral-200 text-title3_sb_20 focus:outline-none focus:border-CoolNeutral-40 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-title3_sb_20 text-CoolNeutral-40">.</span>
              <input
                type="number"
                min={0}
                value={version.patch}
                onChange={(e) => setVersion((v) => ({ ...v, patch: e.target.value }))}
                placeholder="0"
                className="w-[42px] h-[50px] text-center rounded-lg border border-neutral-200 text-title3_sb_20 focus:outline-none focus:border-CoolNeutral-40 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* 이미지 등록하기 */}
          <div className="flex flex-col gap-3 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-title1_sb_28">이미지 등록하기</h2>
                <span className="text-caption1_m_13 text-primary-strong bg-primary-light px-2 py-1 rounded-sm">
                  필수
                </span>
              </div>
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={images.length >= 8}
                className="flex items-center gap-1.5 px-5 py-3.25 w-34.25 h-12 rounded-lg bg-neutral-20 hover:bg-neutral-30 hover:cursor-pointer transition-colors disabled:bg-neutral-90 disabled:cursor-not-allowed"
              >
                <p className="text-sub3_sb_16 text-white">이미지 등록하기</p>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files)}
              />
            </div>
            <p className="text-body3_r_16 text-CoolNeutral-40">
              해당 카테고리의 프로젝트 성장기록을 쉽게 이해할 수 있도록 최소 한 장의 이미지를
              등록해주세요
            </p>
            {images.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setImageModalIndex(index)}
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
                onClick={() => imageInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 w-[225px] h-[127px] rounded-xl border border-dashed border-neutral-200 text-CoolNeutral-50 bg-neutral-99 hover:bg-neutral-95 hover:cursor-pointer transition-colors mt-1"
              >
                <ImageIcon className="size-6" />
                <span className="text-caption1_m_13">이미지 등록</span>
              </button>
            )}
          </div>

          {/* 질문별 답변 */}
          {questions.map((q) => (
            <div
              key={q.questionId}
              className="flex flex-col gap-3 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-title1_sb_28">{q.questionTitle}</h2>
                {q.isRequired && (
                  <span className="text-caption1_m_13 text-primary-strong bg-primary-light px-2 py-1 rounded-sm">
                    필수
                  </span>
                )}
              </div>
              <Editor
                markdown={answers[q.questionId] ?? ''}
                onChange={(val) => setAnswers((prev) => ({ ...prev, [q.questionId]: val }))}
                width="100%"
                height={252}
              />
            </div>
          ))}

          {/* 피드백 태그하기 */}
          <div className="flex flex-col gap-4 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-title1_sb_28">피드백 태그하기</h2>
                <p className="text-body3_r_16 text-CoolNeutral-40">
                  업데이트에 도움이 되었던 피드백을 태그하여 고마움을 전달해보세요 (직군당 최대 3개
                  선택 가능)
                </p>
              </div>
              <button
                onClick={() => setShowFeedbackTagModal(true)}
                className="shrink-0 flex items-center gap-1.5 px-5 py-3.25 h-12 rounded-lg bg-neutral-20 hover:bg-neutral-30 hover:cursor-pointer transition-colors"
              >
                <p className="text-sub3_sb_16 text-white">피드백 태그하기</p>
              </button>
            </div>
            {(() => {
              const taggedIds = taggedFeedbacks[category] ?? []
              const taggedItems = feedbackData.feedbacks[category].filter((f) =>
                taggedIds.includes(f.feedbackId)
              )
              if (taggedItems.length === 0) return null
              return (
                <div className="grid grid-cols-3 gap-4">
                  {taggedItems.map((feedback) => (
                    <div
                      key={feedback.feedbackId}
                      className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-body2_m_14 text-primary-strong">
                            {CATEGORY_LABEL[feedback.category]}
                          </span>
                          <span className="text-title5_sb_20 leading-tight">
                            {feedback.nickname}
                          </span>
                        </div>
                        <button
                          onClick={() => removeTaggedFeedback(category, feedback.feedbackId)}
                          className="shrink-0 w-15 h-10 text-caption1_m_13 text-CoolNeutral-20 border border-CoolNeutral-20 rounded-lg px-2 py-1 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                      <p className="text-body2_m_14 text-CoolNeutral-30 line-clamp-2">
                        {feedback.onelineReview}
                      </p>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sticky top-6">
          <button
            onClick={() => setShowFeedbackTagModal(true)}
            className="w-90 shrink-0 flex flex-col gap-3 bg-white rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] hover:bg-neutral-99 hover:cursor-pointer transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <p className="text-title1_sb_28">피드백 태그하기</p>
              <ChevronRightIcon className="size-5 text-CoolNeutral-40" />
            </div>
            <p className="text-body3_r_16 text-CoolNeutral-40">
              업데이트에 도움이 되었던 피드백을 태그하여 고마움을 전달해보세요 (카테고리 별 최대 3개
              선택 가능)
            </p>
          </button>
          <button
            disabled
            className="w-full h-12 mt-4 bg-neutral-200 text-CoolNeutral-50 rounded-lg text-sub3_sb_16 cursor-not-allowed"
          >
            다음 단계로
          </button>
        </div>
      </div>

      <LeaveConfirmModal
        isOpen={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => window.history.go(-2)}
      />

      <FeedbackTagModal
        key={String(showFeedbackTagModal)}
        isOpen={showFeedbackTagModal}
        onClose={() => setShowFeedbackTagModal(false)}
      />

      <ImageDeleteModal
        isOpen={imageModalIndex !== null}
        images={images}
        currentIndex={imageModalIndex ?? 0}
        onClose={() => setImageModalIndex(null)}
        onPrev={() =>
          setImageModalIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null))
        }
        onNext={() => setImageModalIndex((i) => (i !== null ? (i + 1) % images.length : null))}
        onDelete={() => imageModalIndex !== null && removeImage(imageModalIndex)}
      />
    </div>
  )
}
