const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export type Project = {
  id: number
  title: string
  type: string
  status: string
  oneLineDescription: string
  category: string[]
  thumbnailUrl: string
  feedbackCount: number
  growthRecordCount?: number
}

export async function getProjects(
  params: {
    category?: string
    search?: string
    take?: number
    cursor?: number
  } = {}
): Promise<{ data: Project[]; nextCursor: number | null }> {
  const qs = new URLSearchParams()
  if (params.category) qs.set('category', params.category)
  if (params.search) qs.set('search', params.search)
  if (params.take) qs.set('take', String(params.take))
  if (params.cursor) qs.set('cursor', String(params.cursor))

  const res = await fetch(`${BASE}/project?${qs}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}
