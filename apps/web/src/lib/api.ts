import type { components } from '@/types/api.generated'

export const BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export type CreateVersionDto = components['schemas']['CreateVersionDto']
export type PublishVersionResponseDto = components['schemas']['PublishVersionResponseDto']
export type FeedbackTemplate = components['schemas']['FeedbackTemplateDto']
export type UploadUrlResponse = components['schemas']['UploadUrlResponseDto']
export type CreateProjectDto = components['schemas']['CreateProjectDto']
export type ProjectResponseDto = components['schemas']['ProjectResponseDto']
export type InviteCollaboratorDto = components['schemas']['InviteCollaboratorDto']
export type ProjectRoleResponseDto = components['schemas']['ProjectRoleResponseDto']
export type ProjectListItemDto = components['schemas']['ProjectListItemDto']
export type ProjectDetailResponseDto = components['schemas']['ProjectDetailResponseDto']
export type ProjectVersionListItemDto = components['schemas']['ProjectVersionListItemDto']
export type VersionDetailResponseDto = components['schemas']['VersionDetailResponseDto']
export type MyFeedbackProjectItemDto = components['schemas']['MyFeedbackProjectItemDto']
export type MypageUpdateDto = components['schemas']['MypageUpdateDto']
export type FeedbackQuestionItemDto = components['schemas']['FeedbackQuestionItemDto']
export type CreateFeedbackDto = components['schemas']['CreateFeedbackDto']
export type CreateFeedbackResponseDto = components['schemas']['CreateFeedbackResponseDto']
export type RecordCategory = components['schemas']['RecordCategory']
export type GrowthRecordDraftResponseDto = components['schemas']['GrowthRecordDraftResponseDto']
export type UserProfileResponseDto = components['schemas']['UserProfileResponseDto']

export type MyProfile = {
  name: string
  email: string
  accounts: { providerId: string }[]
  jobType: 'Planner' | 'Designer' | 'Developer' | 'Other' | null
  profileImageUrl: string
  skills: string[]
  links: string[]
  bio: string | null
  ownedTicketCount: number
  joinedProjectCount: number
  feedbackCount: number
}

export type JoinedProject = {
  id: number
  title: string
  oneLineDescription: string
  iconUrl: string
  role: 'Planner' | 'Designer' | 'Developer' | 'Other'
  projectMemberRole: string
}

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
  const body: { data: (Project & { _count?: { versions: number } })[]; nextCursor: number | null } =
    await res.json()
  return {
    ...body,
    data: body.data.map((p) => ({ ...p, growthRecordCount: p._count?.versions ?? 0 })),
  }
}

export async function getProjectById(id: string | number): Promise<ProjectDetailResponseDto> {
  const res = await fetch(`${BASE}/project/${id}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch project')
  return res.json()
}

export async function getMyProjects(): Promise<ProjectListItemDto[]> {
  const res = await fetch(`${BASE}/project/my`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch my projects')
  return res.json()
}

export async function getProjectVersions(
  projectId: string | number
): Promise<ProjectVersionListItemDto[]> {
  const res = await fetch(`${BASE}/project/${projectId}/versions`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch versions')
  return res.json()
}

export async function getVersionDetail(
  projectId: string | number,
  versionId: string | number
): Promise<VersionDetailResponseDto> {
  const res = await fetch(`${BASE}/project/${projectId}/versions/${versionId}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch version detail')
  return res.json()
}

export async function getUploadUrl(
  filename: string,
  contentType: string
): Promise<UploadUrlResponse> {
  const res = await fetch(`${BASE}/storage/upload-url`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType }),
  })
  if (!res.ok) throw new Error('Failed to get upload url')
  return res.json()
}

export async function getDownloadUrl(key: string): Promise<{ url: string }> {
  const res = await fetch(`${BASE}/storage/download-url/${key}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to get download url')
  return res.json()
}

export async function uploadToS3(presignedUrl: string, file: File) {
  await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
}

export async function createProject(dto: CreateProjectDto): Promise<ProjectResponseDto> {
  const res = await fetch(`${BASE}/project`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? '프로젝트 등록에 실패했습니다')
  }
  return res.json()
}

export async function inviteCollaborator(
  projectId: string | number,
  dto: InviteCollaboratorDto
): Promise<ProjectRoleResponseDto> {
  const res = await fetch(`${BASE}/project/${projectId}/invite`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? '팀원 초대에 실패했습니다')
  }
  return res.json()
}

export async function publishVersion(
  projectId: string | number,
  dto: CreateVersionDto
): Promise<PublishVersionResponseDto> {
  const res = await fetch(`${BASE}/project/${projectId}/versions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? '성장기록 발행에 실패했습니다')
  }
  return res.json()
}

export async function getFeedbackTemplates(): Promise<FeedbackTemplate[]> {
  const res = await fetch(`${BASE}/growth-records/feedback-templates`)
  if (!res.ok) throw new Error('Failed to fetch feedback templates')
  return res.json()
}

export async function getMyFeedbacks(): Promise<MyFeedbackProjectItemDto[]> {
  const res = await fetch(`${BASE}/feedbacks/my/projects`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch my feedbacks')
  const body = await res.json()
  return body.data
}

export async function getMyProfile(): Promise<MyProfile> {
  const res = await fetch(`${BASE}/me/profile`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch my profile')
  return res.json()
}

export async function updateMyProfile(dto: MypageUpdateDto): Promise<MyProfile> {
  const res = await fetch(`${BASE}/me/profile`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('Failed to update my profile')
  return res.json()
}

export async function getMyJoinedProjects(): Promise<JoinedProject[]> {
  const res = await fetch(`${BASE}/me/profile/projects`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch joined projects')
  return res.json()
}

export async function getUserProfile(userId: string | number): Promise<UserProfileResponseDto> {
  const res = await fetch(`${BASE}/user/${userId}/profile`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch user profile')
  return res.json()
}

export async function getFeedbackQuestions(
  projectId: string | number,
  versionId: string | number
): Promise<FeedbackQuestionItemDto[]> {
  const res = await fetch(`${BASE}/project/${projectId}/versions/${versionId}/feedbackQuestions`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch feedback questions')
  const body = await res.json()
  return body.data
}

export async function createFeedback(
  projectId: string | number,
  versionId: string | number,
  dto: CreateFeedbackDto
): Promise<CreateFeedbackResponseDto> {
  const res = await fetch(`${BASE}/project/${projectId}/versions/${versionId}/feedbacks`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? '피드백 제출에 실패했습니다')
  }
  return res.json()
}

export async function getDrafts(
  projectId: string | number
): Promise<GrowthRecordDraftResponseDto[]> {
  const res = await fetch(`${BASE}/project/${projectId}/drafts`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch drafts')
  return res.json()
}

export async function getDraft(
  projectId: string | number,
  category: RecordCategory
): Promise<GrowthRecordDraftResponseDto> {
  const res = await fetch(`${BASE}/project/${projectId}/drafts/${category}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch draft')
  return res.json()
}

export async function upsertDraft(
  projectId: string | number,
  category: RecordCategory,
  content: Record<string, unknown>
): Promise<GrowthRecordDraftResponseDto> {
  const res = await fetch(`${BASE}/project/${projectId}/drafts/${category}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error('Failed to save draft')
  return res.json()
}

export async function deleteDraft(
  projectId: string | number,
  category: RecordCategory
): Promise<void> {
  const res = await fetch(`${BASE}/project/${projectId}/drafts/${category}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete draft')
}
