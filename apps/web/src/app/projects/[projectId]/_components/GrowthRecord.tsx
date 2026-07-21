'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  getProjectVersions,
  getVersionDetail,
  getProjectById,
  type ProjectVersionListItemDto,
  type VersionDetailResponseDto,
} from '@/lib/api'
import { RECORD_CATEGORY_LABELS, JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'
import { formatDate } from '@/lib/utils'
import { ImageLightbox } from './ImageLightbox'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { authClient } from '@/lib/auth-client'

const TABS = ['전체 요약', '기획', '디자인', '개발', '기타'] as const
type TabLabel = (typeof TABS)[number]

type GrowthRecordItem = VersionDetailResponseDto['growthRecords'][number]

export function GrowthRecord() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [activeTab, setActiveTab] = useState<TabLabel>('전체 요약')
  const [versions, setVersions] = useState<ProjectVersionListItemDto[]>([])
  const [versionsLoaded, setVersionsLoaded] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState('')
  const [versionDetail, setVersionDetail] = useState<VersionDetailResponseDto | null>(null)
  const [canWriteGrowthRecord, setCanWriteGrowthRecord] = useState(false)

  useEffect(() => {
    getProjectVersions(projectId)
      .then((v) => {
        setVersions(v)
        if (v.length > 0) setSelectedVersion(v[0].id.toString())
      })
      .catch(console.error)
      .finally(() => setVersionsLoaded(true))
  }, [projectId])

  // 성장기록 작성하기 버튼은 프로젝트 참여자(리드 또는 직군 배정된 팀원)에게만 노출
  useEffect(() => {
    if (sessionPending) return
    getProjectById(projectId)
      .then((project) => {
        const isLead = !!session && Number(session.user.id) === project.createdById
        setCanWriteGrowthRecord(isLead || !!project.myJobType)
      })
      .catch(() => setCanWriteGrowthRecord(false))
  }, [projectId, session, sessionPending])

  useEffect(() => {
    if (!selectedVersion) return
    getVersionDetail(projectId, selectedVersion).then(setVersionDetail).catch(console.error)
  }, [projectId, selectedVersion])

  if (!versionsLoaded) return null

  // 버전이 있는데 상세를 아직 못 불러온 상태(로딩 중)에서는 이전 내용이 깜빡이지 않도록 대기
  if (versions.length > 0 && !versionDetail) return null

  const activeRecord = versionDetail?.growthRecords.find(
    (r) => RECORD_CATEGORY_LABELS[r.category] === activeTab
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-head3_sb_36">프로젝트 성장기록</h1>
          <p className="text-sub2_m_18 text-CoolNeutral-40">
            업데이트 날짜 {versionDetail?.releasedAt ? formatDate(versionDetail.releasedAt) : '-'}
          </p>
        </div>
        <div className="flex items-center">
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger className="h-12 px-4 text-body1_m_16 rounded-[8px] hover:cursor-pointer border-neutral-90 [&_svg]:size-5">
              <SelectValue>
                {versions.length > 0 &&
                  `업데이트 버전 ${versions.find((v) => v.id.toString() === selectedVersion)?.version}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              {versions.map((v) => (
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
          {canWriteGrowthRecord && (
            <Button
              onClick={() => router.push(`/projects/${params.projectId}/growthrecord/create`)}
              disabled={versions.length > 0 && selectedVersion !== versions[0].id.toString()}
              className="ml-1.5 h-12 w-[137px] px-5 py-[13px] bg-CoolNeutral-20"
            >
              <p className="text-sub3_sb_16 text-white">성장기록 작성하기</p>
            </Button>
          )}
        </div>
      </div>

      {/* Role filter tabs */}
      <RoleFilterTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabLabel)}
      />

      {/* Content */}
      {activeTab === '전체 요약' ? (
        versionDetail ? (
          <SummarySection versionDetail={versionDetail} />
        ) : (
          <p className="text-body3_r_16 text-CoolNeutral-40">아직 발행된 성장기록이 없습니다.</p>
        )
      ) : activeRecord ? (
        <RecordSection record={activeRecord} />
      ) : (
        <p className="text-body3_r_16 text-CoolNeutral-40">
          해당 카테고리에 발행된 성장기록이 없습니다.
        </p>
      )}
    </div>
  )
}

function SummarySection({ versionDetail }: { versionDetail: VersionDetailResponseDto }) {
  return (
    <div className="flex flex-col gap-12 mt-5">
      <section className="flex flex-col gap-3">
        <h2 className="text-title3_sb_24">이번 업데이트 목표</h2>
        <p className="text-body3_r_16 text-CoolNeutral-30 leading-relaxed">
          {versionDetail.updateGoal}
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-title3_sb_24">이번 업데이트 결과물</h2>
        <ul className="flex flex-col gap-2">
          {versionDetail.updateResults.map((result, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-body3_r_16 text-CoolNeutral-30 leading-relaxed"
            >
              <span>•</span>
              <span>{result}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function RecordSection({ record }: { record: GrowthRecordItem }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sortedImages = [...record.images].sort((a, b) => a.order - b.order)
  const imageUrls = sortedImages.map((img) => img.url)

  return (
    <div className="flex flex-col gap-10">
      {/* Image carousel */}
      {record.images.length > 0 && (
        <ScrollArea className="w-full rounded-xl">
          <div className="flex gap-3 pb-3">
            {sortedImages.map((img, idx) => (
              <div
                key={img.order}
                className="relative shrink-0 w-95 h-55 rounded-xl overflow-hidden bg-neutral-100 cursor-pointer"
                onClick={() => setLightboxIndex(idx)}
              >
                <Image src={img.url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <ImageLightbox
        images={imageUrls}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex((i) => (i! - 1 + imageUrls.length) % imageUrls.length)}
        onNext={() => setLightboxIndex((i) => (i! + 1) % imageUrls.length)}
      />

      {/* Content sections */}
      <div className="flex flex-col gap-12">
        {record.contents.map((section, idx) => (
          <section key={idx} className="flex flex-col gap-3 py-">
            <h2 className="text-title3_sb_24">{section.title}</h2>
            <p className="text-body3_r_16 text-CoolNeutral-30 leading-relaxed">{section.content}</p>
          </section>
        ))}
      </div>

      {/* Tagged feedbacks */}
      {record.taggedFeedbacks.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-title3_sb_24">태그된 피드백</h2>
          <div className="grid grid-cols-3 gap-3">
            {record.taggedFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="border border-neutral-95 rounded-[12px] p-5 flex flex-col"
              >
                <span className={`text-caption1_m_13 text-primary-strong`}>
                  {(feedback.author.role && JOB_API_TO_LABEL[feedback.author.role]) ??
                    feedback.author.role}
                </span>
                <p className="text-sub1_sb_18">{feedback.author.name}</p>
                <p className="text-body2_m_14 text-CoolNeutral-40 mt-3 line-clamp-2">
                  {feedback.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
