'use client'

import { useEffect, useMemo, useState } from 'react'
import GrowthRecordCard from './GrowthRecordCard'
import SectionTitle from './SectionTitle'
import { getRecentGrowthRecords, type RecentGrowthRecordDto } from '@/lib/api'

const RECENT_COUNT = 3

export default function GrowthRecordSection() {
  const [recentGrowthRecords, setRecentGrowthRecords] = useState<RecentGrowthRecordDto[]>([])

  useEffect(() => {
    getRecentGrowthRecords(RECENT_COUNT).then(setRecentGrowthRecords, () =>
      setRecentGrowthRecords([])
    )
  }, [])

  // 발행 버전 하나당 4개 직군 레코드가 flat하게 오므로 버전당 1장만 남긴다
  const recent = useMemo(() => {
    const seenVersionIds = new Set<number>()
    const deduped: RecentGrowthRecordDto[] = []
    for (const record of recentGrowthRecords) {
      if (seenVersionIds.has(record.versionId)) continue
      seenVersionIds.add(record.versionId)
      deduped.push(record)
    }
    return deduped.slice(0, RECENT_COUNT)
  }, [recentGrowthRecords])

  return (
    <section className="flex flex-col gap-7">
      <SectionTitle title="최근 업데이트 된 성장기록" />

      <div className="flex flex-col gap-4">
        {recent.map((record) => (
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
