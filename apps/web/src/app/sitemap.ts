import type { MetadataRoute } from 'next'
import { getProjects } from '@/lib/api'
import { SITE_URL } from '@/lib/site'

/** 목록 API를 커서 페이지네이션으로 끝까지 순회해 전체 프로젝트 id 수집 */
async function getAllProjectIds(): Promise<number[]> {
  const ids: number[] = []
  let cursor: number | undefined

  // 무한루프 방지: nextCursor 가 null 이 될 때까지만 순회
  while (true) {
    const { data, nextCursor } = await getProjects({ take: 100, cursor })
    ids.push(...data.map((p) => p.id))
    if (nextCursor == null) break
    cursor = nextCursor
  }

  return ids
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  let projectEntries: MetadataRoute.Sitemap = []
  try {
    const ids = await getAllProjectIds()
    projectEntries = ids.map((id) => ({
      url: `${SITE_URL}/projects/${id}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    // API 장애 시에도 정적 엔트리는 유지해 sitemap.xml 자체는 응답
    projectEntries = []
  }

  return [...staticEntries, ...projectEntries]
}
