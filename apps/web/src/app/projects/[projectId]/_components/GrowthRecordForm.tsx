'use client'

import { FieldBadge } from '@/components/FieldBadge'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useFeedbackTagStore } from '@/store/feedbackTagStore'
import Image from 'next/image'
import { ChevronRightIcon, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoleFilterTabs } from '@/components/RoleTabs'
import Editor from '@/components/mdxEditor/Editor'
import { ImageDeleteModal } from '@/components/ImageDeleteModal'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'
import { FeedbackTagModal } from '@/components/FeedbackTagModal'
import { GrowthRecordSubmitModal } from '@/components/GrowthRecordSubmitModal'
import growthRecordQuestions from '@/app/_mockdata/project-detail/project-growthrecordQuestion.json'
import {
  JOB_TABS,
  JOB_API_TO_LABEL,
  RECORD_CATEGORY_TO_API,
  RECORD_CATEGORY_LABELS,
} from '@/app/_utils/projectConstants'
import type { JobTab } from '@/app/_utils/projectConstants'
import {
  getUploadUrl,
  uploadToS3,
  getDownloadUrl,
  getDrafts,
  upsertDraft,
  getProjectById,
  getProjectVersions,
  type RecordCategory,
} from '@/lib/api'
import { authClient } from '@/lib/auth-client'

const AUTOSAVE_DELAY_MS = 1000

// content shape은 백엔드 seed.ts(growthRecordDraft.createMany)가 실제로 쓰는 형식을 그대로 따름 —
// answers는 questionId가 아니라 questionTitle로 키(백엔드 성장기록엔 questionId 개념 자체가 없음)
// feedbackQuestions는 FeedbackQuestionsForm이 같은 직군 draft에 함께 저장하는 필드 — 이 컴포넌트는
// 그 값을 모르지만 저장할 때 덮어쓰지 않도록 불러온 그대로 보존한다
type DraftContent = {
  answers: Record<string, string>
  imageKeys: string[]
  version?: { major: string; minor: string; patch: string }
  feedbackQuestions?: unknown
}

type TabLabel = JobTab

const TAB_TO_CATEGORY: Record<TabLabel, keyof typeof growthRecordQuestions.questions> = {
  기획: 'plan',
  디자인: 'design',
  개발: 'dev',
  기타: 'general',
}

type ImageItem = {
  id: string
  preview: string
  uploading: boolean
  key: string | null
}

export function GrowthRecordForm() {
  const params = useParams()
  const projectId = params.projectId as string
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [allowedTabs, setAllowedTabs] = useState<TabLabel[] | null>(null)
  const [isLead, setIsLead] = useState(false)
  const [activeTab, setActiveTab] = useState<TabLabel>('기획')
  const [version, setVersion] = useState({ major: '', minor: '', patch: '' })
  const [imagesByTab, setImagesByTab] = useState<Record<TabLabel, ImageItem[]>>({
    기획: [],
    디자인: [],
    개발: [],
    기타: [],
  })
  const [imageModalIndex, setImageModalIndex] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showFeedbackTagModal, setShowFeedbackTagModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [draftsReady, setDraftsReady] = useState(false)
  const [previousVersionId, setPreviousVersionId] = useState<number | null>(null)
  const { taggedFeedbacks, removeTaggedFeedback } = useFeedbackTagStore()

  const imageInputRef = useRef<HTMLInputElement>(null)
  const preservedFeedbackQuestionsByTab = useRef<Partial<Record<TabLabel, unknown>>>({})
  // "다음 단계로"로 의도적으로 이동할 때는 popstate 핸들러가 이탈 확인 모달을 띄우지 않도록 막는 플래그
  const isNavigatingForwardRef = useRef(false)

  //피드백 태그하기는 이전에 발행된 버전(지금 작성 중인 버전은 아직 존재하지 않음)의 피드백을 대상으로 함
  useEffect(() => {
    getProjectVersions(projectId).then((versions) => {
      setPreviousVersionId(versions[0]?.id ?? null)
    })
  }, [projectId])

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

  // 본인이 초대된 직군만 작성 가능, 프로젝트 등록자(Lead)는 전 직군 작성 가능
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
        if (tabs.length > 0) setActiveTab(tabs[0])
      })
      .catch(() => {
        toast.error('프로젝트 정보를 불러오지 못했습니다')
        setAllowedTabs([])
      })
  }, [projectId, session, sessionPending])

  // 직군별 공유 draft 불러오기 (리드는 전 직군, 팀원은 자기 직군만 응답에 포함됨)
  useEffect(() => {
    if (allowedTabs === null) return
    let cancelled = false

    getDrafts(projectId)
      .then(async (drafts) => {
        const loadedAnswers: Record<number, string> = {}
        const loadedImagesByTab: Partial<Record<TabLabel, ImageItem[]>> = {}
        let loadedVersion: DraftContent['version'] | null = null

        await Promise.all(
          drafts.map(async (draft) => {
            const tab = RECORD_CATEGORY_LABELS[draft.category]
            const mockCategory = TAB_TO_CATEGORY[tab]
            const content = draft.content as Partial<DraftContent>
            preservedFeedbackQuestionsByTab.current[tab] = content.feedbackQuestions
            const answersByTitle = content.answers ?? {}

            // 버전은 프로젝트 전체 단위라 직군 draft마다 같은 값을 들고 있음 — 처음 찾은 값을 사용
            if (!loadedVersion && content.version) {
              loadedVersion = content.version
            }

            // questionTitle -> FE 로컬 questionId 역매핑 (같은 카테고리 안에서는 제목이 유일)
            for (const q of growthRecordQuestions.questions[mockCategory]) {
              if (answersByTitle[q.questionTitle] !== undefined) {
                loadedAnswers[q.questionId] = answersByTitle[q.questionTitle]
              }
            }

            const keys = content.imageKeys ?? []
            loadedImagesByTab[tab] = await Promise.all(
              keys.map(async (key) => {
                const { url } = await getDownloadUrl(key)
                return { id: crypto.randomUUID(), preview: url, uploading: false, key }
              })
            )
          })
        )

        if (cancelled) return
        setAnswers((prev) => ({ ...prev, ...loadedAnswers }))
        setImagesByTab((prev) => ({ ...prev, ...loadedImagesByTab }))
        if (loadedVersion) setVersion(loadedVersion)
      })
      .catch(() => {
        toast.error('임시저장 내용을 불러오지 못했습니다')
      })
      .finally(() => {
        if (!cancelled) setDraftsReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, allowedTabs])

  const category = TAB_TO_CATEGORY[activeTab]
  const categoryApi = RECORD_CATEGORY_TO_API[activeTab] as RecordCategory
  const questions = growthRecordQuestions.questions[category]
  const images = imagesByTab[activeTab]

  // Lead는 발행을 위해 4개 직군 전체가 필요하지만, 팀원은 자기 직군만 채우면 다음 단계로 진행 가능
  const relevantQuestions = isLead
    ? Object.values(growthRecordQuestions.questions).flat()
    : (allowedTabs ?? []).flatMap((tab) => growthRecordQuestions.questions[TAB_TO_CATEGORY[tab]])
  const allRequiredQuestionIds = relevantQuestions
    .filter((q) => q.isRequired)
    .map((q) => q.questionId)

  const isVersionFilled =
    version.major.trim().length > 0 &&
    version.minor.trim().length > 0 &&
    version.patch.trim().length > 0

  const isNextEnabled =
    isVersionFilled && allRequiredQuestionIds.every((id) => (answers[id] ?? '').trim().length > 0)

  // 활성 직군 탭의 이미지/답변을 draft로 자동저장 (초기 로딩 완료 후에만)
  useEffect(() => {
    if (!draftsReady) return

    const timer = setTimeout(() => {
      const categoryApi = RECORD_CATEGORY_TO_API[activeTab] as RecordCategory
      const content: DraftContent = {
        imageKeys: images
          .filter((img) => !img.uploading && img.key)
          .map((img) => img.key as string),
        answers: Object.fromEntries(
          questions.map((q) => [q.questionTitle, answers[q.questionId] ?? ''])
        ),
        version,
        feedbackQuestions: preservedFeedbackQuestionsByTab.current[activeTab],
      }
      upsertDraft(projectId, categoryApi, content).catch(() => {
        toast.error('임시저장에 실패했습니다')
      })
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [projectId, activeTab, images, answers, questions, version, draftsReady])

  const setImages = (updater: (prev: ImageItem[]) => ImageItem[]) => {
    setImagesByTab((prev) => ({ ...prev, [activeTab]: updater(prev[activeTab]) }))
  }

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const selected = Array.from(files).slice(0, 8 - images.length)
    if (selected.length === 0) return

    const newImages: ImageItem[] = selected.map((file) => ({
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      uploading: true,
      key: null,
    }))

    setImages((prev) => [...prev, ...newImages])

    await Promise.all(
      selected.map(async (file, i) => {
        const imageId = newImages[i].id
        try {
          const { url, key } = await getUploadUrl(file.name, file.type)
          await uploadToS3(url, file)
          setImages((prev) =>
            prev.map((img) => (img.id === imageId ? { ...img, uploading: false, key } : img))
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

  if (allowedTabs === null) {
    return (
      <div className="flex items-center justify-center py-30">
        <p className="text-body2_r_18 text-CoolNeutral-30">불러오는 중...</p>
      </div>
    )
  }

  if (allowedTabs.length === 0) {
    return (
      <div className="flex items-center justify-center py-30">
        <p className="text-body2_r_18 text-CoolNeutral-30">
          이 프로젝트의 성장기록을 작성할 권한이 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 mt-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-head3_sb_36">프로젝트 성장기록 작성하기</h1>
          <p className="text-body3_r_16 text-CoolNeutral-40 mt-2">
            이번 업데이트 때 발전된 부분을 작성해보세요
          </p>
        </div>
        <RoleFilterTabs
          tabs={JOB_TABS}
          disabledTabs={JOB_TABS.filter((t) => !allowedTabs.includes(t))}
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
                  <FieldBadge type="필수" />
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
                <FieldBadge type="필수" />
              </div>

              <Button
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={images.length >= 8}
                className="w-34.25 px-5 text-sub3_sb_16"
              >
                이미지 등록하기
              </Button>
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
              해당 카테고리의 프로젝트 성장기록을 쉽게 이해할 수 있도록 이미지를 등록해주세요
              (직군당 최대 8장)
            </p>
            {images.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setImageModalIndex(index)}
                    className="relative w-56.25 h-31.75 shrink-0 rounded-lg overflow-hidden hover:cursor-pointer"
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
                {q.isRequired && <FieldBadge type="필수" />}
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
              <Button
                size="sm"
                onClick={() => setShowFeedbackTagModal(true)}
                disabled={(taggedFeedbacks[categoryApi] ?? []).length >= 3}
                className="shrink-0 px-5 text-sub3_sb_16"
              >
                피드백 태그하기
              </Button>
            </div>
            {(() => {
              const taggedItems = taggedFeedbacks[categoryApi] ?? []
              if (taggedItems.length === 0) return null
              return (
                <div className="grid grid-cols-3 gap-3">
                  {taggedItems.map((entry) => (
                    <div
                      key={`${entry.versionId}:${entry.userId}`}
                      onClick={() => setShowFeedbackTagModal(true)}
                      className="flex flex-col gap-2 rounded-xl border border-neutral-200 px-5 py-4 hover:cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-caption1_m_13 text-primary-strong">
                            {activeTab}
                          </span>
                          <span className="text-title5_sb_20 leading-tight">
                            {entry.author.name}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeTaggedFeedback(categoryApi, entry.versionId, entry.userId)
                          }}
                          className="w-15 shrink-0 text-sub4_sb_14"
                        >
                          삭제
                        </Button>
                      </div>
                      <p className="text-body2_m_14 text-neutral-30 line-clamp-2">
                        {entry.oneLineReview}
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
          <Button
            size="sm"
            disabled={!isNextEnabled}
            onClick={() => setShowSubmitModal(true)}
            className="w-full mt-4 text-sub3_sb_16"
          >
            다음 단계로
          </Button>
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
        projectId={projectId}
        previousVersionId={previousVersionId}
        initialCategory={categoryApi}
        onClose={() => setShowFeedbackTagModal(false)}
      />

      <GrowthRecordSubmitModal
        isOpen={showSubmitModal}
        onCancel={() => setShowSubmitModal(false)}
        onSubmit={() => {
          isNavigatingForwardRef.current = true
          setShowSubmitModal(false)
        }}
        formData={{
          version,
          imagesByTab: Object.fromEntries(
            Object.entries(imagesByTab).map(([tab, imgs]) => [
              tab,
              imgs.filter((img) => !img.uploading && img.key).map((img) => img.key as string),
            ])
          ),
          answers,
          taggedFeedbacks,
        }}
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
