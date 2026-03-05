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
import { Button } from '@/components/ui/button'

type GrowthCategory = 'PLAN' | 'DESIGN' | 'DEVELOP' | 'COMMON'

const TABS = ['기획자', '디자이너', '개발자', '기타'] as const
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

export function Feedbacks() {
  const [activeTab, setActiveTab] = useState<TabLabel>('기획자')
  const [selectedVersion, setSelectedVersion] = useState(versionList[0].id.toString())

  const activeRecord = growthData.growthRecords.find(
    (r) => CATEGORY_TO_TAB[r.category as GrowthCategory] === activeTab
  ) as GrowthRecordItem | undefined

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-head3_sb_36">프로젝트 피드백</h1>
          <p className="text-body3_r_16 text-CoolNeutral-40 mt-2">
            피드백을 작성하고 프로젝트 리뷰 티켓을 받아보세요!
          </p>
        </div>
        <div className="flex items-center">
          <div className="min-h-12">
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="px-4 py-[11px] h-full! text-body1_m_16 rounded-lg border-neutral-200">
                <SelectValue>
                  <p className="text-body1_m_16">
                    업데이트 버전{' '}
                    {versionList.find((v) => v.id.toString() === selectedVersion)?.version}
                  </p>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="h-12">
                {versionList.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    버전 {v.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="ml-[6px] h-12 w-[137px] px-5 py-[13px] bg-CoolNeutral-20">
            <p className="text-sub3_sb_16 text-white">피드백 작성하기</p>
          </Button>
        </div>
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-1 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] border-neutral-200 rounded-full p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 hover:cursor-pointer rounded-full text-body1_m_16 transition-colors ${
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
      {/* {activeRecord ? (
        <RecordSection record={activeRecord} />
      ) : (
        <p className="text-body3_r_16 text-CoolNeutral-40">해당 카테고리의 기록이 없습니다.</p>
      )} */}
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
