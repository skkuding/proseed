'use client'

import { useMemo, useState } from 'react'
import { RoleFilterTabs } from '@/components/RoleTabs'
import GrowthRecordCard from './GrowthRecordCard'
import SectionTitle from './SectionTitle'
import recentGrowthRecords from '@/app/_mockdata/mainpage/recent-growth-records.json'

const TABS = ['기획', '디자인', '개발', '기타'] as const
type Tab = (typeof TABS)[number]

const TAB_TO_CATEGORY: Record<Tab, string> = {
  기획: 'PLAN',
  디자인: 'DESIGN',
  개발: 'DEVELOPMENT',
  기타: 'GENERAL',
}

export default function GrowthRecordSection() {
  const [activeTab, setActiveTab] = useState<Tab>('기획')

  const filtered = useMemo(() => {
    return recentGrowthRecords.filter((rg) => rg.category === TAB_TO_CATEGORY[activeTab])
  }, [activeTab])

  return (
    <section className="flex flex-col gap-7">
      <div className="flex justify-between">
        <SectionTitle title="최근 업데이트 된 성장기록" />

        <RoleFilterTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as Tab)}
        />
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((record) => (
          <GrowthRecordCard
            key={record.versionId}
            projectId={record.projectId}
            projectName={record.projectName}
            projectIconUrl={record.projectIconUrl}
            versionTitle={record.versionTitle}
            updateGoal={record.updateGoal}
            projectCategories={record.projectCategories}
            createdAt={record.createdAt}
          />
        ))}
      </div>
    </section>
  )
}
