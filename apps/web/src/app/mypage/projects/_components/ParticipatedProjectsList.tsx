'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { JOB_TABS, type JobTab } from '@/app/_utils/projectConstants'
import { ParticipatedProjectCard, type ParticipatedProject } from './ParticipatedProjectCard'

interface ParticipatedProjectsListProps {
  projects: ParticipatedProject[]
  /** 빈 상태에서 "프로젝트 참여하기" CTA 노출 여부 (내 마이페이지에서만 의미가 있어 기본 true) */
  showJoinCta?: boolean
}

export function ParticipatedProjectsList({
  projects,
  showJoinCta = true,
}: ParticipatedProjectsListProps) {
  const [selectedJob, setSelectedJob] = useState<JobTab>('기획')

  const filteredProjects = projects.filter((project) => project.role === selectedJob)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-head3_sb_36 text-black">참여한 프로젝트</p>

        <RoleFilterTabs
          tabs={JOB_TABS}
          activeTab={selectedJob}
          onTabChange={(tab) => setSelectedJob(tab as JobTab)}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 bg-white px-9 py-20">
          <div className="flex flex-col items-center gap-2">
            <p className="text-title3_sb_24 text-black">아직 참여한 프로젝트가 없어요</p>
            {showJoinCta && (
              <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
                <p>다양한 직군으로 참여하여</p>
                <p>프로젝트를 수행하고 커리어 성장을 이뤄보세요</p>
              </div>
            )}
          </div>
          {showJoinCta && (
            <Button asChild size="lg" className="text-sub3_sb_16">
              <Link href="/myproject">프로젝트 참여하기</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredProjects.map((project) => (
            <ParticipatedProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
