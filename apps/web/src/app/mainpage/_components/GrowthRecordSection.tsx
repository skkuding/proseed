'use client'

import { useEffect, useMemo, useState } from 'react'
import { RoleFilterTabs } from '@/components/RoleTabs'
import GrowthRecordCard from './GrowthRecordCard'
import SectionTitle from './SectionTitle'
import { getRecentGrowthRecords, type RecentGrowthRecordDto } from '@/lib/api'
import { JOB_TABS, RECORD_CATEGORY_TO_API, type JobTab } from '@/app/_utils/projectConstants'

export default function GrowthRecordSection() {
  const [activeTab, setActiveTab] = useState<JobTab>('기획')
  const [recentGrowthRecords, setRecentGrowthRecords] = useState<RecentGrowthRecordDto[]>([])

  useEffect(() => {
    getRecentGrowthRecords().then(setRecentGrowthRecords, () => setRecentGrowthRecords([]))
  }, [])

  const filtered = useMemo(() => {
    return recentGrowthRecords.filter((rg) => rg.category === RECORD_CATEGORY_TO_API[activeTab])
  }, [activeTab, recentGrowthRecords])

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
            key={record.growthRecordId}
            projectId={record.projectId}
            projectName={record.projectName}
            projectIconUrl={record.projectIconUrl}
            title={record.title}
            updateGoal={record.updateGoal}
            projectCategories={record.projectCategories}
            releasedAt={String(record.releasedAt)}
          />
        ))}
      </div>
    </section>
  )
}
