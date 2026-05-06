'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import growthData from '@/app/_mockdata/project-detail/project-growthrecord.json'
import versionList from '@/app/_mockdata/project-detail/project-version.json'
import { formatDate } from '@/lib/utils'
import { ImageLightbox } from './ImageLightbox'
import { RoleFilterTabs } from '@/components/RoleTabs'

const TABS = ['전체 요약', '기획자', '디자이너', '개발자', '기타'] as const
type TabLabel = (typeof TABS)[number]

const CATEGORY_TO_TAB: Record<string, TabLabel> = {
  PLAN: '기획자',
  DESIGN: '디자이너',
  DEVELOP: '개발자',
  COMMON: '기타',
}

const ROLE_LABEL: Record<string, string> = {
  PLANNER: '기획자',
  DESIGNER: '디자이너',
  DEVELOPER: '개발자',
}

type GrowthRecordItem = {
  id: number
  versionId: number
  category: string
  createdAt: string
  updatedAt: string
  contents: { title: string; content: string }[]
  images: { order: number; url: string }[]
  taggedFeedbacks: {
    id: number
    author: { name: string; profileImageUrl: string; role: string }
    content: string
  }[]
}

export function GrowthRecord() {
  const [activeTab, setActiveTab] = useState<TabLabel>('전체 요약')
  const [selectedVersion, setSelectedVersion] = useState(versionList[0].id.toString())

  const activeRecord = growthData.growthRecords.find(
    (r) => CATEGORY_TO_TAB[r.category] === activeTab
  ) as GrowthRecordItem | undefined

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-head3_sb_36">프로젝트 성장기록</h1>
          <p className="text-body3_r_16 text-CoolNeutral-40 mt-2">
            업데이트 날짜 {formatDate(growthData.releasedAt)}
          </p>
        </div>
        <Select value={selectedVersion} onValueChange={setSelectedVersion}>
          <SelectTrigger className="h-12 px-4 text-body1_m_16 rounded-lg border-neutral-200">
            <SelectValue>
              업데이트 버전 {versionList.find((v) => v.id.toString() === selectedVersion)?.version}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {versionList.map((v) => (
              <SelectItem key={v.id} value={v.id.toString()}>
                버전 {v.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Role filter tabs */}
      <RoleFilterTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabLabel)}
      />

      {/* Content */}
      {activeTab === '전체 요약' ? (
        <SummarySection />
      ) : activeRecord ? (
        <RecordSection record={activeRecord} />
      ) : (
        <p className="text-body3_r_16 text-CoolNeutral-40">해당 카테고리의 기록이 없습니다.</p>
      )}
    </div>
  )
}

function SummarySection() {
  return (
    <div className="flex flex-col gap-10 mt-5">
      <section className="flex flex-col gap-3">
        <h2 className="text-title3_sb_20">이번 업데이트 목표</h2>
        <p className="text-body3_r_16 text-CoolNeutral-30 leading-relaxed">
          {growthData.updateGoal}
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-title3_sb_20">이번 업데이트 결과물</h2>
        <ul className="flex flex-col gap-2">
          {growthData.updateResults.map((result, idx) => (
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
          <div className="flex gap-4 pb-3">
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
      {record.contents.map((section, idx) => (
        <section key={idx} className="flex flex-col gap-3">
          <h2 className="text-title3_sb_20">{section.title}</h2>
          <p className="text-body3_r_16 text-CoolNeutral-30 leading-relaxed">{section.content}</p>
        </section>
      ))}

      {/* Tagged feedbacks */}
      {record.taggedFeedbacks.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-title3_sb_20">태그된 피드백</h2>
          <div className="grid grid-cols-3 gap-3">
            {record.taggedFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="border border-neutral-200 rounded-xl p-5 flex flex-col"
              >
                <span className={`text-caption1_m_13 text-primary-strong`}>
                  {ROLE_LABEL[feedback.author.role] ?? feedback.author.role}
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
