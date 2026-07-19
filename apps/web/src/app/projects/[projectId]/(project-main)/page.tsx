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

/**
 * 공유 카드(og:image)용 안정 이미지 URL.
 * 크롤러가 공개 인터넷에서 가져가므로 공개 API 주소를 쓴다(서버 fetch 용 내부 URL 아님).
 * 이 엔드포인트가 매 요청 새 presigned 로 302 → presigned 만료로 이미지가 깨지지 않는다.
 */
function thumbnailImageUrl(projectId: string): string {
  const publicApi = process.env.NEXT_PUBLIC_API_URL || '/api'
  // 상대 경로로 설정된 경우에도 SITE_URL 을 붙여 항상 절대 URL 로 만든다 (크롤러가 파싱 가능하도록).
  const base = publicApi.startsWith('http') ? publicApi : `${SITE_URL}${publicApi}`
  return `${base}/project/${projectId}/thumbnail`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectId } = await params
  const project = await getProject(projectId)
  if (!project) return {}

  const url = `${SITE_URL}/projects/${projectId}`
  const image = thumbnailImageUrl(projectId)
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
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.oneLineDescription,
      images: [image],
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
            image: thumbnailImageUrl(projectId),
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
