'use client'

import { useEffect, useState } from 'react'
import { JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'
import { getMyJoinedProjects } from '@/lib/api'
import { type ParticipatedProject } from '@/app/mypage/projects/_components/ParticipatedProjectCard'
import { ParticipatedProjectsList } from '@/app/mypage/projects/_components/ParticipatedProjectsList'

export default function MyParticipatedProjects() {
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

  return <ParticipatedProjectsList projects={projects} />
}
