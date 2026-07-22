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
  getProjectVersions,
  getFeedbacksForVersion,
  type ProjectVersionListItemDto,
  type FeedbackListItemDto,
} from '@/lib/api'
import { RECORD_CATEGORY_TO_API, JOB_TABS, type JobTab } from '@/app/_utils/projectConstants'

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

  const handleRoleSelectConfirm = (selectedRoles: string[]) => {
    setShowRoleSelectModal(false)
    const roles = selectedRoles.map((r) => RECORD_CATEGORY_TO_API[r as TabLabel]).join(',')
    router.push(`/projects/${projectId}/feedback/create?version=${selectedVersion}&roles=${roles}`)
  }

  //메인페이지/마이페이지 카드에서 특정 버전의 피드백으로 딥링크될 때 해당 버전을 기본 선택
  useEffect(() => {
    getProjectVersions(projectId).then((versions) => {
      setVersionList(versions)
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

  useEffect(() => {
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
  }, [projectId, selectedVersion])

  const loading = selectedVersion !== '' && loadedVersion !== selectedVersion

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
          <p className="text-body3_r_16 text-CoolNeutral-40 mt-2">
            다른 팀의 프로젝트에 피드백을 남겨보세요!
          </p>
        </div>
        <div className="flex items-center">
          <div className="min-h-12">
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="px-4 rounded-lg border-neutral-90 text-body1_m_16! hover:cursor-pointer [&_svg]:size-5">
                <SelectValue>
                  업데이트 버전{' '}
                  {versionList.find((v) => v.id.toString() === selectedVersion)?.version}
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
            onClick={() => setShowRoleSelectModal(true)}
            disabled={!versionList[0] || selectedVersion !== versionList[0].id.toString()}
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
          onTabChange={(tab) => handleTabChange(tab as TabLabel)}
        />

        <div className="flex items-center gap-2">
          <FeedbackAdoptionFilterButton value={adoptionFilter} onApply={handleFilterApply} />

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[105px] h-12 pr-4 pl-6 rounded-[8px] border border-neutral-90 text-body1_m_16! gap-1 hover:cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
        <p className="text-body3_r_16 text-CoolNeutral-40 py-10 text-center">
          해당 카테고리의 피드백이 없습니다.
        </p>
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
    </div>
  )
}
