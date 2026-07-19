import type { Metadata } from 'next'
import { getProjectById } from '@/lib/api'
import { SITE_URL } from '@/lib/site'
import { JsonLd } from '@/components/JsonLd'
import { GrowthRecord } from '../_components/GrowthRecord'

type PageProps = { params: Promise<{ projectId: string }> }

/** 조회 실패(미존재·API 장애) 시 null 을 반환해 루트 메타데이터로 폴백시킨다. */
async function getProject(projectId: string) {
  try {
    return await getProjectById(projectId)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectId } = await params
  const project = await getProject(projectId)
  if (!project) return {}

  const url = `${SITE_URL}/projects/${projectId}`
  return {
    title: project.title,
    description: project.oneLineDescription,
    alternates: { canonical: url },
    // Next 는 metadata 를 얕게 병합한다 — openGraph/twitter 를 여기서 정의하면
    // 루트 값이 통째로 교체되므로, 유지할 필드(siteName·locale·card)를 다시 넣는다.
    openGraph: {
      type: 'article',
      siteName: 'PROSEED',
      locale: 'ko_KR',
      title: project.title,
      description: project.oneLineDescription,
      url,
    },
    twitter: {
      card: 'summary_large_image',
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
