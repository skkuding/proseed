import { cache } from 'react'
import type { Metadata } from 'next'
import { getProjectById } from '@/lib/api'
import { SITE_URL } from '@/lib/site'
import { JsonLd } from '@/components/JsonLd'
import { GrowthRecord } from '../_components/GrowthRecord'

type PageProps = { params: Promise<{ projectId: string }> }

/**
 * generateMetadata 와 페이지 컴포넌트가 같은 요청에서 각각 프로젝트를 조회한다.
 * React cache 로 요청당 한 번만 실제 호출되도록 메모이즈.
 * 조회 실패(미존재·API 장애) 시 null → 루트 메타데이터로 폴백.
 */
const getProject = cache(async (projectId: string) => {
  try {
    return await getProjectById(projectId)
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectId } = await params
  const project = await getProject(projectId)
  if (!project) return {}

  const url = `${SITE_URL}/projects/${projectId}`
  return {
    title: project.title,
    description: project.oneLineDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.oneLineDescription,
      url,
    },
    twitter: {
      title: project.title,
      description: project.oneLineDescription,
    },
  }
}

export default async function ProjectDetailRecord({ params }: PageProps) {
  const { projectId } = await params
  const project = await getProject(projectId)

  return (
    <>
      {project && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.title,
            description: project.oneLineDescription,
            url: `${SITE_URL}/projects/${projectId}`,
            dateModified: project.updatedAt,
            author: project.projectRoles.map((role) => ({
              '@type': 'Person',
              name: role.user.name,
            })),
          }}
        />
      )}
      <GrowthRecord />
    </>
  )
}
