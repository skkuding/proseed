import type { MetadataRoute } from 'next'
import { getProjects } from '@/lib/api'
import { SITE_URL } from '@/lib/site'

/**
 * sitemap 은 기본적으로 빌드 시점에 한 번 생성·캐시된다.
 * 그러면 새로 등록/삭제된 프로젝트가 재배포 전까지 반영되지 않으므로,
 * 1시간마다 재생성(ISR)해 프로젝트 목록을 최신으로 유지한다.
 */
export const revalidate = 3600

/** 커서가 이상 동작해도 폭주하지 않도록 상한 (100페이지 × take 100 = 1만 프로젝트) */
const MAX_PAGES = 100

/** 목록 API를 커서 페이지네이션으로 끝까지 순회해 전체 프로젝트 id 수집 */
async function getAllProjectIds(): Promise<number[]> {
  const ids: number[] = []
  let cursor: number | undefined

  // 무한루프·OOM 방지: 페이지 상한 + 빈 데이터 + 동일 커서 반복 시 탈출
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, nextCursor } = await getProjects({ take: 100, cursor })
    if (data.length === 0) break
    ids.push(...data.map((p) => p.id))
    if (nextCursor == null || nextCursor === cursor) break
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
