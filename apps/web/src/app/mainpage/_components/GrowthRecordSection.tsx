'use client'

import { useMemo, useState } from 'react'
import { RoleFilterTabs } from '@/components/RoleTabs'
import GrowthRecordCard from './GrowthRecordCard'
import SectionTitle from './SectionTitle'
import recentGrowthRecords from '@/app/_mockdata/mainpage/recent-growth-records.json'
import { JOB_TABS, type JobTab } from '@/app/_utils/projectConstants'

const TAB_TO_CATEGORY: Record<JobTab, string> = {
  기획자: 'PLAN',
  디자이너: 'DESIGN',
  개발자: 'DEVELOPMENT',
  기타: 'GENERAL',
}

export default function GrowthRecordSection() {
  const [activeTab, setActiveTab] = useState<JobTab>('기획자')

  const filtered = useMemo(() => {
    return recentGrowthRecords.filter((rg) => rg.category === TAB_TO_CATEGORY[activeTab])
  }, [activeTab])

  return (
    <section className="flex flex-col gap-7">
      <div className="flex justify-between">
        <SectionTitle title="최근 업데이트 된 성장기록" />

        <RoleFilterTabs
          tabs={JOB_TABS}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as JobTab)}
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
