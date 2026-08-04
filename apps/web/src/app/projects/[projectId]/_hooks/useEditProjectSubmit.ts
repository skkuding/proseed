'use client'

import { type Dispatch, type SetStateAction, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CATEGORY_TO_API, STATUS_TO_API } from '../register/_components/constants'
import { type JobTab, type Member, type ImageItem } from '@/app/_utils/projectConstants'
import { JOB_TO_API } from '@/app/_utils/projectConstants'
import {
  inviteCollaborator,
  removeCollaborator,
  updateProject,
  getUploadUrl,
  uploadToS3,
  type ProjectDetailResponseDto,
  type InviteCollaboratorDto,
  type UpdateProjectDto,
} from '@/lib/api'
import { trackEvent } from '@/lib/analytics'

async function uploadImage(file: File): Promise<string> {
  const { url, key } = await getUploadUrl(file.name, file.type)
  await uploadToS3(url, file)
  return key
}

interface UseEditProjectSubmitParams {
  project: ProjectDetailResponseDto
  memberEmail: string
  memberTab: JobTab
  setMembers: Dispatch<SetStateAction<Member[]>>
  addMember: (member: { name: string; ownRole: string; profileImageUrl: string }) => void
  projectImages: ImageItem[]
  iconFile: File | null
  thumbnailFile: File | null
  title: string
  projectType: 'APP' | 'WEB' | null
  status: string | null
  oneLineDescription: string
  description: string
  selectedCategories: string[]
  contactPath: string
  projectLink: string
  canSubmit: boolean
}

export function useEditProjectSubmit({
  project,
  memberEmail,
  memberTab,
  setMembers,
  addMember,
  projectImages,
  iconFile,
  thumbnailFile,
  title,
  projectType,
  status,
  oneLineDescription,
  description,
  selectedCategories,
  contactPath,
  projectLink,
  canSubmit,
}: UseEditProjectSubmitParams) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // 팀원 초대는 추가 즉시 실제 API를 호출 (기본정보/이미지 수정은 "적용하기" 클릭 시 handleSave에서 한 번에 저장)
  async function handleAddMember(member: {
    name: string
    ownRole: string
    profileImageUrl: string
  }) {
    const invitedEmail = memberEmail.trim()
    const projectRole = await inviteCollaborator(project.id, {
      email: invitedEmail,
      role: JOB_TO_API[memberTab] as InviteCollaboratorDto['role'],
    })
    trackEvent('collaborator_invited', { role: JOB_TO_API[memberTab] })
    addMember(member)
    // addMember는 방금 입력한 실제 이메일을 email 필드에 그대로 남긴다.
    // handleRemoveMember는 기존 팀원처럼 `member-{projectRoleId}` 형식을 기대하므로
    // 초대 응답으로 받은 projectRole.id로 맞춰줘야 삭제 시 올바른 id가 전달된다.
    setMembers((prev) =>
      prev.map((m) => (m.email === invitedEmail ? { ...m, email: `member-${projectRole.id}` } : m))
    )
  }

  // 팀원 삭제도 초대와 동일하게 즉시 실제 API를 호출
  async function handleRemoveMember(email: string) {
    const memberId = email.replace(/^member-/, '')
    try {
      await removeCollaborator(project.id, memberId)
      setMembers((prev) => prev.filter((m) => m.email !== email))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '팀원 삭제에 실패했습니다.')
    }
  }

  // 기존 이미지는 presigned 조회 URL만 갖고 있어(raw S3 key 없음) 그대로 유지할 땐 imageKeys를 아예 보내지 않음.
  // 목록이 바뀐 경우(추가/삭제) 기존 이미지의 key를 복원할 방법이 없어 전체 재업로드를 요구함.
  const initialImages = [...project.images].sort((a, b) => a.order - b.order)
  const imagesUnchanged =
    projectImages.length === initialImages.length &&
    projectImages.every((img, i) => !img.file && img.preview === initialImages[i].url)

  async function handleSave() {
    if (!canSubmit || submitting) return

    if (!imagesUnchanged && projectImages.some((img) => !img.file)) {
      toast.error(
        '이미지 목록을 변경하려면 전체 이미지를 다시 등록해주세요. (일부만 바꾸는 건 아직 지원하지 않아요)'
      )
      return
    }

    setSubmitting(true)
    try {
      const dto: UpdateProjectDto = {
        title,
        type: projectType as UpdateProjectDto['type'],
        status: STATUS_TO_API[status!] as UpdateProjectDto['status'],
        oneLineDescription,
        description,
        category: selectedCategories.map((c) => CATEGORY_TO_API[c]) as UpdateProjectDto['category'],
        contactPath,
        projectLink,
      }
      if (iconFile) dto.iconKey = await uploadImage(iconFile)
      if (thumbnailFile) dto.thumbnailKey = await uploadImage(thumbnailFile)
      if (!imagesUnchanged) {
        dto.imageKeys = await Promise.all(projectImages.map((img) => uploadImage(img.file!)))
      }

      await updateProject(project.id, dto)
      toast.success('프로젝트가 수정되었습니다.')
      router.push(`/projects/${project.id}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '수정 중 오류가 발생했습니다. 다시 시도해주세요.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return { submitting, handleAddMember, handleRemoveMember, handleSave }
}
