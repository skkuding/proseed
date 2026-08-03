'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Accordion } from '@/components/ui/accordion'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ConfirmModal'
import { ImageLightbox } from './ImageLightbox'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { FeedbackRoleSelectModal } from '@/components/FeedbackRoleSelectModal'
import {
  FeedbackAdoptionFilterButton,
  type FeedbackAdoptionFilter,
} from '@/components/FeedbackAdoptionFilterButton'
import { FeedbackSubmissionCard, buildSubmissionCards } from './FeedbackSubmissionCard'
import {
  getProjectById,
  getProjectVersions,
  getFeedbacksForVersion,
  getFreeformFeedbacks,
  getMyProfile,
  unlockFeedback,
  unlockFreeformFeedback,
  ApiError,
  type ProjectVersionListItemDto,
  type FeedbackListItemDto,
} from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/authStore'
import {
  RECORD_CATEGORY_TO_API,
  JOB_TABS,
  jobTabToPersonLabel,
  type JobTab,
} from '@/app/_utils/projectConstants'

type TabLabel = JobTab

function getVisiblePages(total: number): number[] {
  return Array.from({ length: total }, (_, i) => i + 1)
}

export function Feedbacks() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.projectId as string
  const [versionList, setVersionList] = useState<ProjectVersionListItemDto[]>([])
  const [versionsLoaded, setVersionsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabLabel>('기획')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [feedbacks, setFeedbacks] = useState<FeedbackListItemDto[]>([])
  const [loadedVersion, setLoadedVersion] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [openSubmissionId, setOpenSubmissionId] = useState<string>('')
  const [selectedQuestions, setSelectedQuestions] = useState<Record<number, number>>({})
  const [sortOrder, setSortOrder] = useState('latest')
  const [adoptionFilter, setAdoptionFilter] = useState<FeedbackAdoptionFilter>('all')
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)
  const [highlightId, setHighlightId] = useState<number | null>(null)
  const [showRoleSelectModal, setShowRoleSelectModal] = useState(false)
  const [isMyProject, setIsMyProject] = useState(false)
  const [showSelfFeedbackModal, setShowSelfFeedbackModal] = useState(false)
  const { data: session } = authClient.useSession()
  const { openLoginModal } = useAuthStore()
  const [ticketCount, setTicketCount] = useState<number | null>(null)
  const [unlockingId, setUnlockingId] = useState<number | null>(null)
  const [unlockError, setUnlockError] = useState<{ id: number; message: string } | null>(null)
  const [showInsufficientTicketModal, setShowInsufficientTicketModal] = useState(false)

  useEffect(() => {
    getProjectById(projectId)
      .then((project) => setIsMyProject(project.isMyProject))
      .catch(() => setIsMyProject(false))
  }, [projectId])

  useEffect(() => {
    if (!session) {
      setTicketCount(null)
      return
    }
    getMyProfile()
      .then((profile) => setTicketCount(profile.ownedTicketCount))
      .catch(() => setTicketCount(null))
  }, [session])

  const handleUnlock = async (submissionId: number, category: FeedbackListItemDto['category']) => {
    if (!session) {
      openLoginModal()
      return
    }
    setUnlockError(null)
    setUnlockingId(submissionId)
    try {
      if (versionList.length === 0) {
        const result = await unlockFreeformFeedback(projectId, submissionId, category)
        setTicketCount(result.remainingTickets)
        setFeedbacks(await getFreeformFeedbacks(projectId))
      } else {
        const result = await unlockFeedback(projectId, selectedVersion, submissionId, category)
        setTicketCount(result.remainingTickets)
        setFeedbacks(await getFeedbacksForVersion(projectId, selectedVersion))
      }
    } catch (e) {
      if (e instanceof ApiError && e.code === 'INSUFFICIENT_TICKET') {
        setShowInsufficientTicketModal(true)
      } else {
        setUnlockError({
          id: submissionId,
          message: e instanceof Error ? e.message : '피드백 열람에 실패했습니다',
        })
      }
    } finally {
      setUnlockingId(null)
    }
  }

  const handleWriteFeedbackClick = () => {
    if (isMyProject) {
      setShowSelfFeedbackModal(true)
      return
    }
    // 성장기록(버전)이 아직 없으면 직군 선택 모달 없이 자유 피드백 작성 페이지로 바로 이동
    if (!versionList[0]) {
      router.push(`/projects/${projectId}/feedback/create`)
      return
    }
    setShowRoleSelectModal(true)
  }

  const handleRoleSelectConfirm = (selectedRoles: string[]) => {
    setShowRoleSelectModal(false)
    const roles = selectedRoles.map((r) => RECORD_CATEGORY_TO_API[r as TabLabel]).join(',')
    router.push(`/projects/${projectId}/feedback/create?version=${selectedVersion}&roles=${roles}`)
  }

  //메인페이지/마이페이지 카드에서 특정 버전의 피드백으로 딥링크될 때 해당 버전을 기본 선택
  useEffect(() => {
    getProjectVersions(projectId).then((versions) => {
      setVersionList(versions)
      setVersionsLoaded(true)
      setSelectedVersion((prev) => {
        if (prev) return prev
        const versionParam = searchParams.get('version')
        if (versionParam && versions.some((v) => v.id.toString() === versionParam)) {
          return versionParam
        }
        return versions[0] ? versions[0].id.toString() : ''
      })
    })
  }, [projectId, searchParams])

  // 성장기록(버전)이 아직 없는 프로젝트는 versionId 없이 남긴 자유 피드백 목록을 대신 불러온다
  const feedbackKey = versionList.length > 0 ? selectedVersion : 'freeform'

  useEffect(() => {
    if (!versionsLoaded) return
    if (versionList.length === 0) {
      getFreeformFeedbacks(projectId)
        .then((data) => {
          setFeedbacks(data)
          setLoadedVersion('freeform')
        })
        .catch(() => {
          setFeedbacks([])
          setLoadedVersion('freeform')
        })
      return
    }
    if (!selectedVersion) return
    getFeedbacksForVersion(projectId, selectedVersion)
      .then((data) => {
        setFeedbacks(data)
        setLoadedVersion(selectedVersion)
      })
      .catch(() => {
        setFeedbacks([])
        setLoadedVersion(selectedVersion)
      })
  }, [projectId, selectedVersion, versionList, versionsLoaded])

  const loading = versionsLoaded && loadedVersion !== feedbackKey

  //메인페이지 "최근 피드백" 카드 딥링크 — 현재 불러온 버전 안에서만 찾을 수 있음
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#feedback-')) return
    const targetId = parseInt(hash.replace('#feedback-', ''))
    if (isNaN(targetId)) return

    const match = feedbacks.find((f) => f.submissionId === targetId)
    if (!match) return

    const tabLabel = (Object.entries(RECORD_CATEGORY_TO_API).find(
      ([, api]) => api === match.category
    )?.[0] ?? '기획') as TabLabel

    queueMicrotask(() => {
      setActiveTab(tabLabel)
      setOpenSubmissionId(String(targetId))
      setSelectedQuestions((prev) => ({ ...prev, [targetId]: match.questionId }))
    })

    setTimeout(() => {
      const el = document.getElementById(`feedback-${targetId}`)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightId(targetId)
      setTimeout(() => setHighlightId(null), 2000)
    }, 100)
  }, [feedbacks])

  const handleTabChange = (tab: TabLabel) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setOpenSubmissionId('')
  }

  const handleFilterApply = (mode: FeedbackAdoptionFilter) => {
    setAdoptionFilter(mode)
    setCurrentPage(1)
    setOpenSubmissionId('')
  }

  const categoryApi = RECORD_CATEGORY_TO_API[activeTab]
  const allCards = buildSubmissionCards(feedbacks.filter((f) => f.category === categoryApi))
    .filter((card) => adoptionFilter === 'all' || card.isAdopted)
    .sort((a, b) =>
      sortOrder === 'oldest'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt)
    )
  const pageSize = 5
  const totalPages = Math.ceil(allCards.length / pageSize)
  const cards = allCards.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    setOpenSubmissionId('')
  }

  const handleAccordionChange = (value: string) => {
    setOpenSubmissionId(value)
    if (value) {
      const submissionId = parseInt(value)
      if (!selectedQuestions[submissionId]) {
        const card = cards.find((c) => c.submissionId === submissionId)
        if (card?.questions[0]) {
          setSelectedQuestions((prev) => ({
            ...prev,
            [submissionId]: card.questions[0].questionId,
          }))
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-head3_sb_36">프로젝트 피드백</h1>
          <p className="text-sub2_m_18 text-CoolNeutral-50 mt-2">
            피드백을 작성하고 프로젝트 리뷰 티켓을 받아보세요!
          </p>
        </div>
        <div className="flex items-center">
          <div className="min-h-12">
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="px-4 rounded-[8px] border-neutral-90 text-body1_m_16! hover:cursor-pointer [&_svg]:size-5">
                <SelectValue placeholder="업데이트 버전 -">
                  {versionList.length > 0 &&
                    `업데이트 버전 ${versionList.find((v) => v.id.toString() === selectedVersion)?.version}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                {versionList.map((v) => (
                  <SelectItem
                    key={v.id}
                    value={v.id.toString()}
                    className="text-body1_m_16! hover:cursor-pointer"
                  >
                    버전 {v.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="md"
            onClick={handleWriteFeedbackClick}
            // 성장기록(버전)이 아직 없으면 자유 피드백 작성이 가능하므로 막지 않는다.
            // 버전이 있을 때는 최신 버전을 보고 있을 때만 작성 가능.
            disabled={!!versionList[0] && selectedVersion !== versionList[0].id.toString()}
            className="ml-1.5 w-[137px] text-sub3_sb_16"
          >
            피드백 작성하기
          </Button>
        </div>
      </div>

      {/* Role filter tabs + filter/sort */}
      <div className="flex items-center justify-between">
        <RoleFilterTabs
          tabs={JOB_TABS}
          activeTab={activeTab}
          getLabel={jobTabToPersonLabel}
          onTabChange={(tab) => handleTabChange(tab as TabLabel)}
        />

        <div className="flex items-center gap-2">
          <FeedbackAdoptionFilterButton value={adoptionFilter} onApply={handleFilterApply} />

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[105px] h-12 pr-4 pl-6 rounded-[8px] border border-neutral-90 text-body1_m_16! gap-1 hover:cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="latest" className="text-body1_m_16! hover:cursor-pointer">
                최신순
              </SelectItem>
              <SelectItem value="oldest" className="text-body1_m_16! hover:cursor-pointer">
                오래된순
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback list */}
      {loading ? (
        <p className="text-body3_r_16 text-CoolNeutral-40 py-10 text-center">불러오는 중...</p>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="flex flex-col items-center gap-2">
            <p className="text-title3_sb_24">해당 카테고리의 피드백이 없습니다</p>
            <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
              <p>피드백을 남겨 응원하는 서비스의</p>
              <p>성장을 함께 만들어 보세요!</p>
            </div>
          </div>
          <Button
            onClick={handleWriteFeedbackClick}
            disabled={!!versionList[0] && selectedVersion !== versionList[0].id.toString()}
            size="lg"
            className="text-sub3_sb_16"
          >
            피드백 작성하기
          </Button>
        </div>
      ) : (
        <div className="ml-[-20px]">
          <Accordion
            type="single"
            collapsible
            value={openSubmissionId}
            onValueChange={handleAccordionChange}
            className="flex flex-col pl-3"
          >
            {cards.map((card) => (
              <FeedbackSubmissionCard
                key={card.submissionId}
                card={card}
                isOpen={openSubmissionId === String(card.submissionId)}
                isHighlighted={highlightId === card.submissionId}
                selectedQuestionId={
                  selectedQuestions[card.submissionId] ?? card.questions[0]?.questionId
                }
                onSelectQuestion={(questionId) =>
                  setSelectedQuestions((prev) => ({ ...prev, [card.submissionId]: questionId }))
                }
                onImageClick={(images, index) => setLightbox({ images, index })}
                canUnlock={isMyProject}
                ticketCount={ticketCount}
                isUnlocking={unlockingId === card.submissionId}
                unlockErrorMessage={
                  unlockError?.id === card.submissionId ? unlockError.message : null
                }
                onUnlock={() => handleUnlock(card.submissionId, card.category)}
              />
            ))}
          </Accordion>
          {/* Pagination */}
          <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(currentPage - 1)
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-40' : ''}
                />
              </PaginationItem>
              {getVisiblePages(totalPages).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(page)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-40' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          currentIndex={lightbox.index}
          isOpen={true}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox(
              (prev) =>
                prev && {
                  ...prev,
                  index: (prev.index - 1 + prev.images.length) % prev.images.length,
                }
            )
          }
          onNext={() =>
            setLightbox((prev) => prev && { ...prev, index: (prev.index + 1) % prev.images.length })
          }
        />
      )}

      <FeedbackRoleSelectModal
        isOpen={showRoleSelectModal}
        onClose={() => setShowRoleSelectModal(false)}
        onConfirm={handleRoleSelectConfirm}
        projectId={projectId}
        versionId={selectedVersion}
      />

      <ConfirmModal
        isOpen={showSelfFeedbackModal}
        title="본인 프로젝트에는 피드백을 작성할 수 없어요"
        description="다른 프로젝트를 구경하고 피드백을 작성해보세요"
        cancelLabel="취소"
        confirmLabel="피드백 작성하기"
        confirmButtonClassName="w-auto px-5"
        onCancel={() => setShowSelfFeedbackModal(false)}
        onConfirm={() => router.push('/navigate')}
      />

      <ConfirmModal
        isOpen={showInsufficientTicketModal}
        title="티켓이 부족하여 피드백을 해제할 수 없어요"
        description="티켓은 타 프로젝트에 피드백을 남기거나, 성장기록을 작성하면 얻을 수 있어요. 피드백을 작성하고 티켓을 받아볼까요?"
        cancelLabel="취소"
        confirmLabel="피드백 작성하기"
        confirmButtonClassName="w-auto px-5"
        onCancel={() => setShowInsufficientTicketModal(false)}
        onConfirm={() => router.push('/navigate')}
      />
    </div>
  )
}
