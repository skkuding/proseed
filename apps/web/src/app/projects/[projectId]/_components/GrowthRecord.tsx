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

type GrowthCategory = 'PLAN' | 'DESIGN' | 'DEVELOP' | 'COMMON'

const TABS = ['전체 요약', '기획자', '디자이너', '개발자', '기타'] as const
type TabLabel = (typeof TABS)[number]

const CATEGORY_TO_TAB: Record<GrowthCategory, TabLabel> = {
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

const ROLE_COLOR: Record<string, string> = {
  PLANNER: 'text-amber-600',
  DESIGNER: 'text-blue-500',
  DEVELOPER: 'text-emerald-600',
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`
}

type TaggedFeedback = {
  id: number
  author: { name: string; profileImageUrl: string; role: string }
  content: string
}

type GrowthRecordItem = {
  id: number
  versionId: number
  category: string
  createdAt: string
  updatedAt: string
  contents: { title: string; content: string }[]
  images: { order: number; url: string }[]
  taggedFeedbacks: TaggedFeedback[]
}

export function GrowthRecord() {
  const [activeTab, setActiveTab] = useState<TabLabel>('전체 요약')
  const [selectedVersion, setSelectedVersion] = useState(versionList[0].id.toString())

  const activeRecord = growthData.growthRecords.find(
    (r) => CATEGORY_TO_TAB[r.category as GrowthCategory] === activeTab
  ) as GrowthRecordItem | undefined

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-head3_sb_36">프로젝트 성장기록</h1>
          <p className="text-body3_r_16 text-CoolNeutral-40 mt-1">
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
      <div className="flex gap-1 border border-neutral-200 rounded-full p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-body1_m_16 transition-colors ${
              activeTab === tab
                ? 'bg-CoolNeutral-20 text-white'
                : 'text-CoolNeutral-40 hover:text-CoolNeutral-20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">이번 업데이트 목표</h2>
        <p className="text-body3_r_16 text-CoolNeutral-30 leading-relaxed">
          {growthData.updateGoal}
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">이번 업데이트 결과물</h2>
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
  return (
    <div className="flex flex-col gap-10">
      {/* Image carousel */}
      {record.images.length > 0 && (
        <ScrollArea className="w-full rounded-xl">
          <div className="flex gap-4 pb-3">
            {[...record.images]
              .sort((a, b) => a.order - b.order)
              .map((img) => (
                <div
                  key={img.order}
                  className="relative flex-shrink-0 w-[380px] h-[220px] rounded-xl overflow-hidden bg-neutral-100"
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </div>
              ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Content sections */}
      {record.contents.map((section, idx) => (
        <section key={idx} className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">{section.title}</h2>
          <p className="text-body3_r_16 text-CoolNeutral-30 leading-relaxed">{section.content}</p>
        </section>
      ))}

      {/* Tagged feedbacks */}
      {record.taggedFeedbacks.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">태그된 피드백</h2>
          <div className="grid grid-cols-3 gap-4">
            {record.taggedFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="border border-neutral-200 rounded-xl p-5 flex flex-col gap-2"
              >
                <span
                  className={`text-body4_r_14 font-medium ${ROLE_COLOR[feedback.author.role] ?? 'text-CoolNeutral-40'}`}
                >
                  {ROLE_LABEL[feedback.author.role] ?? feedback.author.role}
                </span>
                <p className="text-sub2_m_18 font-semibold">{feedback.author.name}</p>
                <p className="text-body4_r_14 text-CoolNeutral-40 leading-relaxed line-clamp-3">
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
