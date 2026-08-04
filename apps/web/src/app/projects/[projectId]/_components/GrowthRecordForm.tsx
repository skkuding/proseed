'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFeedbackTagStore } from '@/store/feedbackTagStore'
import { useGrowthRecordStore } from '@/store/growthRecordStore'
import { ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { ImageDeleteModal } from '@/components/ImageDeleteModal'
import { FeedbackTagModal } from '@/components/FeedbackTagModal'
import { VersionInputCard } from './VersionInputCard'
import { ImageUploadCard, type ImageItem } from './ImageUploadCard'
import { GrowthRecordQuestionCard } from './GrowthRecordQuestionCard'
import { FeedbackTagSection } from './FeedbackTagSection'
import growthRecordQuestions from '@/app/_mockdata/project-detail/project-growthrecordQuestion.json'
import {
  JOB_TABS,
  JOB_API_TO_LABEL,
  RECORD_CATEGORY_TO_API,
  RECORD_CATEGORY_LABELS,
  jobTabToPersonLabel,
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

function buildDraftContent(
  tab: TabLabel,
  imgs: ImageItem[],
  answersMap: Record<number, string>,
  versionValue: DraftContent['version'],
  preservedFeedbackQuestions: unknown
): DraftContent {
  return {
    imageKeys: imgs.filter((img) => !img.uploading && img.key).map((img) => img.key as string),
    answers: Object.fromEntries(
      growthRecordQuestions.questions[TAB_TO_CATEGORY[tab]].map((q) => [
        q.questionTitle,
        answersMap[q.questionId] ?? '',
      ])
    ),
    version: versionValue,
    feedbackQuestions: preservedFeedbackQuestions,
  }
}

export function GrowthRecordForm() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [allowedTabs, setAllowedTabs] = useState<TabLabel[] | null>(null)
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
  const [showFeedbackTagModal, setShowFeedbackTagModal] = useState(false)
  const [draftsReady, setDraftsReady] = useState(false)
  const [previousVersionId, setPreviousVersionId] = useState<number | null>(null)
  const { taggedFeedbacks, removeTaggedFeedback } = useFeedbackTagStore()
  const setStoreVersion = useGrowthRecordStore((s) => s.setVersion)
  const setStoreImagesByTab = useGrowthRecordStore((s) => s.setImagesByTab)
  const setStoreAnswers = useGrowthRecordStore((s) => s.setAnswers)
  const setStoreTaggedFeedbacks = useGrowthRecordStore((s) => s.setTaggedFeedbacks)

  const preservedFeedbackQuestionsByTab = useRef<Partial<Record<TabLabel, unknown>>>({})
  // 디바운스로 아직 서버에 반영되지 않은 최신 내용 — 탭 전환/이탈 시 즉시 flush하는 데 사용
  const pendingDraftRef = useRef<{ category: RecordCategory; content: DraftContent } | null>(null)

  //피드백 태그하기는 이전에 발행된 버전(지금 작성 중인 버전은 아직 존재하지 않음)의 피드백을 대상으로 함
  useEffect(() => {
    getProjectVersions(projectId).then((versions) => {
      setPreviousVersionId(versions[0]?.id ?? null)
    })
  }, [projectId])

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

  // "다음 단계로"를 거치지 않고 상단 탭으로 바로 피드백 질문 페이지로 넘어가도
  // 발행 시점(FeedbackQuestionsForm)에 최신 값을 읽을 수 있도록 항상 동기화
  useEffect(() => {
    setStoreVersion(version)
  }, [version, setStoreVersion])

  useEffect(() => {
    setStoreImagesByTab(
      Object.fromEntries(
        Object.entries(imagesByTab).map(([tab, imgs]) => [
          tab,
          imgs.filter((img) => !img.uploading && img.key).map((img) => img.key as string),
        ])
      )
    )
  }, [imagesByTab, setStoreImagesByTab])

  useEffect(() => {
    setStoreAnswers(answers)
  }, [answers, setStoreAnswers])

  useEffect(() => {
    setStoreTaggedFeedbacks(taggedFeedbacks)
  }, [taggedFeedbacks, setStoreTaggedFeedbacks])

  // 활성 직군 탭의 이미지/답변을 draft로 자동저장 (초기 로딩 완료 후에만)
  useEffect(() => {
    if (!draftsReady) return

    const content = buildDraftContent(
      activeTab,
      images,
      answers,
      version,
      preservedFeedbackQuestionsByTab.current[activeTab]
    )
    pendingDraftRef.current = { category: categoryApi, content }

    const timer = setTimeout(() => {
      pendingDraftRef.current = null
      upsertDraft(projectId, categoryApi, content).catch(() => {
        toast.error('임시저장에 실패했습니다')
      })
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [projectId, activeTab, categoryApi, images, answers, questions, version, draftsReady])

  // 디바운스가 끝나기 전에 다른 직군 탭으로 바꾸거나 페이지를 벗어나면 위 타이머가 취소되면서
  // 방금 입력한 내용이 그대로 유실됐다 — 탭이 바뀌거나 언마운트되는 시점에 남은 저장을 즉시 반영한다
  useEffect(() => {
    return () => {
      const pending = pendingDraftRef.current
      if (!pending) return
      pendingDraftRef.current = null
      upsertDraft(projectId, pending.category, pending.content).catch(() => {
        toast.error('임시저장에 실패했습니다')
      })
    }
  }, [projectId, activeTab])

  const setImages = (updater: (prev: ImageItem[]) => ImageItem[]) => {
    setImagesByTab((prev) => ({ ...prev, [activeTab]: updater(prev[activeTab]) }))
  }

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const selected = Array.from(files).slice(0, 8 - images.length)
    if (selected.length === 0) return

    // 업로드 도중 다른 직군 탭으로 넘어가도, 완료된 이미지는 "지금 활성 탭"이 아니라
    // 업로드를 시작한 이 탭에 저장돼야 한다 — 클로저로 캡처해둔다
    const originTab = activeTab
    const originCategoryApi = RECORD_CATEGORY_TO_API[originTab] as RecordCategory

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
          setImagesByTab((prev) => {
            const updated = prev[originTab].map((img) =>
              img.id === imageId ? { ...img, uploading: false, key } : img
            )
            // 자동저장 effect는 "지금 활성 탭"만 지켜보므로, 업로드가 끝난 시점에 이미
            // 다른 탭으로 넘어가 있었다면 이 완료를 영영 저장할 기회가 없다 — 여기서 직접 저장한다
            const content = buildDraftContent(
              originTab,
              updated,
              answers,
              version,
              preservedFeedbackQuestionsByTab.current[originTab]
            )
            upsertDraft(projectId, originCategoryApi, content).catch(() => {
              toast.error('임시저장에 실패했습니다')
            })
            return { ...prev, [originTab]: updated }
          })
        } catch {
          setImagesByTab((prev) => ({
            ...prev,
            [originTab]: prev[originTab].map((img) =>
              img.id === imageId ? { ...img, uploading: false } : img
            ),
          }))
        }
      })
    )
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
          getLabel={jobTabToPersonLabel}
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
          <VersionInputCard version={version} onChange={setVersion} />

          <ImageUploadCard
            images={images}
            onFilesSelected={handleImageSelect}
            onImageClick={setImageModalIndex}
          />

          {/* 질문별 답변 */}
          {questions.map((q) => (
            <GrowthRecordQuestionCard
              key={q.questionId}
              title={q.questionTitle}
              isRequired={q.isRequired}
              value={answers[q.questionId] ?? ''}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [q.questionId]: val }))}
            />
          ))}

          <FeedbackTagSection
            activeTabLabel={activeTab}
            taggedItems={taggedFeedbacks[categoryApi] ?? []}
            maxCount={3}
            onOpen={() => setShowFeedbackTagModal(true)}
            onRemove={(versionId, userId) => removeTaggedFeedback(categoryApi, versionId, userId)}
          />
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
              업데이트에 도움이 되었던 피드백을 태그하여 고마움을 전달해보세요 (직군당 최대 3개 선택
              가능)
            </p>
          </button>
          <Button
            size="sm"
            onClick={() => {
              router.replace(`/projects/${projectId}/growthrecord/feedback-questions`)
            }}
            className="w-full mt-4 text-sub3_sb_16"
          >
            다음 단계로
          </Button>
        </div>
      </div>

      <FeedbackTagModal
        key={String(showFeedbackTagModal)}
        isOpen={showFeedbackTagModal}
        projectId={projectId}
        previousVersionId={previousVersionId}
        initialCategory={categoryApi}
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
