'use client'

import { useEffect, useMemo, useState } from 'react'
import GrowthRecordCard, { GrowthRecordCardSkeleton } from './GrowthRecordCard'
import SectionTitle from './SectionTitle'
import { getRecentGrowthRecords, type RecentGrowthRecordDto } from '@/lib/api'

const RECENT_COUNT = 3
// 같은 프로젝트가 여러 번 발행되면 백엔드가 버전 단위로 최신순 take를 채우기 때문에,
// 카드 3장을 서로 다른 프로젝트로 채우려면 후보군을 넉넉히 받아와 프로젝트 단위로 걸러야 한다.
const FETCH_COUNT = 20

export default function GrowthRecordSection() {
  const [recentGrowthRecords, setRecentGrowthRecords] = useState<RecentGrowthRecordDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getRecentGrowthRecords(FETCH_COUNT)
      .then(setRecentGrowthRecords, () => setRecentGrowthRecords([]))
      .finally(() => setIsLoading(false))
  }, [])

  // 발행 버전 하나당 4개 직군 레코드가 flat하게 오고, 같은 프로젝트가 여러 버전으로 나올 수도 있으므로
  // 프로젝트당 가장 최근 성장기록 1장만 남긴다 (releasedAt desc로 오므로 첫 등장이 최신).
  const recent = useMemo(() => {
    const seenProjectIds = new Set<number>()
    const deduped: RecentGrowthRecordDto[] = []
    for (const record of recentGrowthRecords) {
      if (seenProjectIds.has(record.projectId)) continue
      seenProjectIds.add(record.projectId)
      deduped.push(record)
    }
    return deduped.slice(0, RECENT_COUNT)
  }, [recentGrowthRecords])

  return (
    <section className="flex flex-col gap-7">
      <SectionTitle title="최근 업데이트 된 성장기록" />

      <div className="flex flex-col gap-4">
        {isLoading
          ? Array.from({ length: RECENT_COUNT }).map((_, idx) => (
              <GrowthRecordCardSkeleton key={idx} />
            ))
          : recent.map((record) => (
              <GrowthRecordCard
                key={record.growthRecordId}
                projectId={record.projectId}
                projectName={record.projectName}
                projectIconUrl={record.projectIconUrl}
                updateGoal={record.updateGoal}
                updateResults={record.updateResults}
                projectCategories={record.projectCategories}
                releasedAt={String(record.releasedAt)}
              />
            ))}
      </div>
    </section>
  )
}
