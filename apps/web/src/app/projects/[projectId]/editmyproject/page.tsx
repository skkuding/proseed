'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { ConfirmModal } from '@/components/ConfirmModal'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'
import { CategorySection } from '../register/_components/CategorySection'
import { ProjectTypeSection } from '../register/_components/ProjectTypeSection'
import { ProjectNameSection } from '../register/_components/ProjectNameSection'
import { ProjectLinkSection } from '../register/_components/ProjectLinkSection'
import { ProjectDescriptionSection } from '../register/_components/ProjectDescriptionSection'
import { ProjectStatusSection } from '../register/_components/ProjectStatusSection'
import { ContactPathSection } from '../register/_components/ContactPathSection'
import { TeamMembersSection } from '../register/_components/TeamMembersSection'
import { ProjectSummary } from '../register/_components/ProjectSummary'
import { IconSection } from '../register/_components/IconSection'
import { ThumbnailSection } from '../register/_components/ThumbnailSection'
import { ProjectImagesSection } from '../register/_components/ProjectImagesSection'
import { CATEGORY_LABELS, CATEGORY_TO_API, STATUS_TO_API } from '../register/_components/constants'
import { JOB_TO_API, JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'
import { useProjectForm } from '../_hooks/useProjectForm'
import { useAuthGuard } from '@/lib/useAuthGuard'
import {
  getProjectById,
  inviteCollaborator,
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

const API_TO_STATUS = Object.fromEntries(
  Object.entries(STATUS_TO_API).map(([label, api]) => [api, label])
)

export default function EditMyProject() {
  useAuthGuard()
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<ProjectDetailResponseDto | null>(null)

  useEffect(() => {
    getProjectById(projectId).then(setProject, () => {
      toast.error('프로젝트 정보를 불러오지 못했습니다.')
    })
  }, [projectId])

  if (!project) {
    return (
      <main className="min-h-screen bg-neutral-99 flex items-center justify-center">
        <p className="text-body2_r_18 text-CoolNeutral-30">불러오는 중...</p>
      </main>
    )
  }

  return <EditMyProjectForm project={project} />
}

function EditMyProjectForm({ project }: { project: ProjectDetailResponseDto }) {
  const router = useRouter()
  const [tab, setTab] = useState<'basic' | 'image'>('basic')
  const [submitting, setSubmitting] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setShowLeaveModal(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const {
    selectedCategories,
    setProjectType,
    title,
    setTitle,
    projectLink,
    setProjectLink,
    projectType,
    oneLineDescription,
    setOneLineDescription,
    description,
    setDescription,
    status,
    setStatus,
    contactPath,
    setContactPath,
    memberTab,
    setMemberTab,
    memberEmail,
    setMemberEmail,
    members,
    setMembers,
    iconFile,
    thumbnailFile,
    iconPreview,
    thumbnailPreview,
    projectImages,
    setProjectImages,
    basicDone,
    imageDone,
    allBasicDone,
    canSubmit,
    toggleCategory,
    addMember,
    handleIconSelect,
    handleThumbnailSelect,
    handleAddProjectImages,
  } = useProjectForm({
    categories: project.category.map((c) => CATEGORY_LABELS[c] ?? c),
    type: project.type as 'APP' | 'WEB',
    title: project.title,
    projectLink: project.projectLink,
    oneLineDescription: project.oneLineDescription,
    description: project.description,
    status: API_TO_STATUS[project.status] ?? null,
    contactPath: project.contactPath,
    iconPreview: project.iconUrl,
    thumbnailPreview: project.thumbnailUrl,
    hasExistingImages: project.images.length > 0,
    projectImages: [...project.images]
      .sort((a, b) => a.order - b.order)
      .map((img) => ({ preview: img.url })),
    members: project.projectRoles.map((m) => ({
      email: `member-${m.id}`,
      role: JOB_API_TO_LABEL[m.role] ?? '기획',
      name: m.user.name,
      ownRole: `${JOB_API_TO_LABEL[m.role] ?? m.role} 참여자`,
      profileImageUrl: m.user.profileImageUrl,
    })),
  })

  // 팀원 초대는 추가 즉시 실제 API를 호출 (기본정보/이미지 수정은 "적용하기" 클릭 시 handleSave에서 한 번에 저장)
  async function handleAddMember(member: {
    name: string
    ownRole: string
    profileImageUrl: string
  }) {
    await inviteCollaborator(project.id, {
      email: memberEmail.trim(),
      role: JOB_TO_API[memberTab] as InviteCollaboratorDto['role'],
    })
    trackEvent('collaborator_invited', { role: JOB_TO_API[memberTab] })
    addMember(member)
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

  return (
    <main className="min-h-screen bg-neutral-99">
      <div className="mx-auto max-w-[1200px] pt-10">
        <h1 className="text-head0_sb_52 mb-5">프로젝트 편집하기</h1>

        <div className="mb-6">
          <RoleFilterTabs
            tabs={['기본 정보', '이미지']}
            activeTab={tab === 'basic' ? '기본 정보' : '이미지'}
            onTabChange={(t) => {
              if (t === '이미지' && !allBasicDone) return
              setTab(t === '기본 정보' ? 'basic' : 'image')
            }}
          />
        </div>

        <div className="flex gap-6">
          <div className="flex-1 flex flex-col gap-5">
            {tab === 'basic' ? (
              <>
                <CategorySection selected={selectedCategories} onToggle={toggleCategory} />
                <ProjectTypeSection value={projectType} onChange={setProjectType} />
                <ProjectNameSection value={title} onChange={setTitle} />
                <ProjectLinkSection value={projectLink} onChange={setProjectLink} />
                <ProjectDescriptionSection
                  oneLineDescription={oneLineDescription}
                  description={description}
                  onChangeOneLine={setOneLineDescription}
                  onChangeDesc={setDescription}
                />
                <ProjectStatusSection value={status} onChange={setStatus} />
                <ContactPathSection value={contactPath} onChange={setContactPath} />
                <TeamMembersSection
                  memberTab={memberTab}
                  onMemberTabChange={setMemberTab}
                  memberEmail={memberEmail}
                  onMemberEmailChange={setMemberEmail}
                  members={members}
                  onAddMember={handleAddMember}
                  onRemoveMember={(email) =>
                    setMembers((prev) => prev.filter((m) => m.email !== email))
                  }
                />
              </>
            ) : (
              <>
                <IconSection preview={iconPreview} onSelect={handleIconSelect} />
                <ThumbnailSection preview={thumbnailPreview} onSelect={handleThumbnailSelect} />
                <ProjectImagesSection
                  images={projectImages}
                  onAdd={handleAddProjectImages}
                  onRemove={(idx) => setProjectImages((prev) => prev.filter((_, i) => i !== idx))}
                />
              </>
            )}
          </div>

          <ProjectSummary
            tab={tab}
            basicDone={basicDone}
            imageDone={imageDone}
            allBasicDone={allBasicDone}
            canSubmit={canSubmit}
            submitting={submitting}
            onNext={() => setTab('image')}
            onSubmit={() => setShowSaveConfirm(true)}
            selectedCategories={selectedCategories}
            projectType={projectType}
            hasMember={members.length > 0}
            submitLabel="프로젝트 편집하기"
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={showSaveConfirm}
        title="편집 사항을 적용하시겠습니까?"
        description="현재 작성하신 내용은 편집 사항 적용 후에도 수정이 가능해요."
        confirmLabel="적용할래요"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={() => {
          setShowSaveConfirm(false)
          handleSave()
        }}
      />

      <LeaveConfirmModal
        isOpen={showLeaveModal}
        title="프로젝트 편집을 취소하고 이전 페이지로 돌아가시겠습니까?"
        description="프로젝트 편집 취소 후, 지금까지 작성한 내용은 복구가 불가합니다."
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => window.history.go(-2)}
      />
    </main>
  )
}
