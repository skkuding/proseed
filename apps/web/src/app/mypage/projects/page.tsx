'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { JOB_API_TO_LABEL, JOB_TABS, type JobTab } from '@/app/_utils/projectConstants'
import { getMyJoinedProjects } from '@/lib/api'
import {
  ParticipatedProject,
  ParticipatedProjectCard,
} from '@/app/mypage/projects/_components/ParticipatedProjectCard'

export default function MyParticipatedProjects() {
  const [selectedJob, setSelectedJob] = useState<JobTab>('기획')
  const [projects, setProjects] = useState<ParticipatedProject[]>([])

  useEffect(() => {
    getMyJoinedProjects()
      .then((data) =>
        setProjects(
          data.map((project) => ({
            id: project.id,
            title: project.title,
            role: JOB_API_TO_LABEL[project.role] ?? project.role,
            description: project.oneLineDescription,
            href: `/projects/${project.id}`,
            imageUrl: project.iconUrl,
          }))
        )
      )
      .catch(console.error)
  }, [])

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
            <div className="flex flex-col items-center text-body3_r_16 text-CoolNeutral-40">
              <p>다양한 직군으로 참여하여</p>
              <p>프로젝트를 수행하고 커리어 성장을 이뤄보세요</p>
            </div>
          </div>
          <Button asChild size="lg" className="text-sub3_sb_16">
            <Link href="/myproject">프로젝트 참여하기</Link>
          </Button>
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
