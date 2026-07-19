'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
import { CATEGORY_LABELS, STATUS_TO_API } from '../register/_components/constants'
import { JOB_TO_API, JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'
import { useProjectForm } from '../_hooks/useProjectForm'
import { useAuthGuard } from '@/lib/useAuthGuard'
import { authClient } from '@/lib/auth-client'
import {
  getProjectById,
  inviteCollaborator,
  type ProjectDetailResponseDto,
  type InviteCollaboratorDto,
} from '@/lib/api'

const API_TO_STATUS = Object.fromEntries(
  Object.entries(STATUS_TO_API).map(([label, api]) => [api, label])
)

export default function EditMyProject() {
  useAuthGuard()
  const { projectId } = useParams<{ projectId: string }>()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [project, setProject] = useState<ProjectDetailResponseDto | null>(null)

  useEffect(() => {
    getProjectById(projectId).then(setProject, () => {
      toast.error('프로젝트 정보를 불러오지 못했습니다.')
    })
  }, [projectId])

  if (!project || sessionPending) {
    return (
      <main className="min-h-screen bg-neutral-99 flex items-center justify-center">
        <p className="text-body2_r_18 text-CoolNeutral-30">불러오는 중...</p>
      </main>
    )
  }

  return <EditMyProjectForm project={project} session={session} />
}

function EditMyProjectForm({
  project,
  session,
}: {
  project: ProjectDetailResponseDto
  session: ReturnType<typeof authClient.useSession>['data']
}) {
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
    // TODO: ProjectMemberDto에 userId가 없어서 이름으로 본인 여부를 추정 중 (백엔드가 userId를 내려주면 정확히 비교)
    members: project.projectRoles
      .filter((m) => !session || session.user.name !== m.user.name)
      .map((m) => ({
        email: `member-${m.id}`,
        role: JOB_API_TO_LABEL[m.role] ?? '기획',
        name: m.user.name,
        ownRole: `${JOB_API_TO_LABEL[m.role] ?? m.role} 참여자`,
        profileImageUrl: m.user.profileImageUrl,
      })),
  })

  // 팀원 초대는 추가 즉시 실제 API를 호출 (기본정보/이미지 수정 저장은 백엔드에 PATCH 라우트가 아직 없음)
  async function handleAddMember(member: {
    name: string
    ownRole: string
    profileImageUrl: string
  }) {
    await inviteCollaborator(project.id, {
      email: memberEmail.trim(),
      role: JOB_TO_API[memberTab] as InviteCollaboratorDto['role'],
    })
    addMember(member)
  }

  async function handleSave() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      // TODO: PATCH /project/:id 라우트가 백엔드에 생기면 기본정보/이미지 저장 연결
      toast.error(
        '기본 정보·이미지 수정 저장 기능은 아직 준비 중입니다. (팀원 초대는 이미 반영되었습니다)'
      )
    } catch {
      toast.error('수정 중 오류가 발생했습니다. 다시 시도해주세요.')
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
