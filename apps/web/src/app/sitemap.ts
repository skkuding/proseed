import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'
import { getProjects } from '@/lib/api'
import { SITE_URL } from '@/lib/site'

/**
 * 빌드 시점엔 API(클러스터 내부 주소)에 닿을 수 없어 빈 sitemap 이 구워지므로,
 * 정적 프리렌더를 끄고 런타임에 생성한다.
 */
export const dynamic = 'force-dynamic'

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

/**
 * 매 요청마다 목록 API 를 순회하면 부하가 크므로, 결과를 런타임에 1시간 캐시한다.
 * (force-dynamic 이라 빌드 시점엔 실행되지 않고, 첫 런타임 요청이 내부 API 로 채운다.)
 */
const getCachedProjectIds = unstable_cache(getAllProjectIds, ['sitemap-project-ids'], {
  revalidate: 3600,
})

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
    const ids = await getCachedProjectIds()
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
