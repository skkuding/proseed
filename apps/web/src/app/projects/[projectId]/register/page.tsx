'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { ConfirmModal } from '@/components/ConfirmModal'
import { LeaveConfirmModal } from '@/components/LeaveConfirmModal'
import { CategorySection } from './_components/CategorySection'
import { ProjectTypeSection } from './_components/ProjectTypeSection'
import { ProjectNameSection } from './_components/ProjectNameSection'
import { ProjectLinkSection } from './_components/ProjectLinkSection'
import { ProjectDescriptionSection } from './_components/ProjectDescriptionSection'
import { ProjectStatusSection } from './_components/ProjectStatusSection'
import { ContactPathSection } from './_components/ContactPathSection'
import { TeamMembersSection } from './_components/TeamMembersSection'
import { ProjectSummary } from './_components/ProjectSummary'
import { IconSection } from './_components/IconSection'
import { ThumbnailSection } from './_components/ThumbnailSection'
import { ProjectImagesSection } from './_components/ProjectImagesSection'
import { CATEGORY_TO_API, STATUS_TO_API, JOB_TO_API, type JobTab } from './_components/constants'
import { JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'
import { useProjectForm } from '../_hooks/useProjectForm'
import { useAuthGuard } from '@/lib/useAuthGuard'
import { trackEvent } from '@/lib/analytics'
import {
  createProject,
  inviteCollaborator,
  getUploadUrl,
  uploadToS3,
  getMyProfile,
  type CreateProjectDto,
  type InviteCollaboratorDto,
} from '@/lib/api'

async function uploadImage(file: File): Promise<string> {
  const { url, key } = await getUploadUrl(file.name, file.type)
  await uploadToS3(url, file)
  return key
}

export default function RegisterProject() {
  useAuthGuard()
  const router = useRouter()
  const [tab, setTab] = useState<'basic' | 'image'>('basic')
  const [submitting, setSubmitting] = useState(false)
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)
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

  // 리더(등록자) 본인의 직군 — 로그인 시 온보딩에서 설정된 실제 값을 사용 (하드코딩 금지)
  const [profileJobType, setProfileJobType] = useState<JobTab | null>(null)
  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        if (profile.jobType) setProfileJobType(JOB_API_TO_LABEL[profile.jobType])
      })
      .catch(() => {
        toast.error('내 직군 정보를 불러오지 못했습니다.')
      })
  }, [])
  const leaderJobType: JobTab = profileJobType ?? '기획'

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
    iconPreview,
    thumbnailFile,
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
  } = useProjectForm()

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    if (!profileJobType) {
      toast.error('내 직군 정보를 아직 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    setSubmitting(true)
    try {
      const [iconKey, thumbnailKey, ...imageKeys] = await Promise.all([
        uploadImage(iconFile!),
        uploadImage(thumbnailFile!),
        ...projectImages.map((img) => uploadImage(img.file!)),
      ])

      const project = await createProject({
        title,
        type: projectType as CreateProjectDto['type'],
        status: STATUS_TO_API[status!] as CreateProjectDto['status'],
        oneLineDescription,
        description,
        category: selectedCategories.map((c) => CATEGORY_TO_API[c]) as CreateProjectDto['category'],
        contactPath,
        leaderJobType: JOB_TO_API[leaderJobType] as CreateProjectDto['leaderJobType'],
        projectLink,
        iconKey,
        thumbnailKey,
        imageKeys,
      })

      trackEvent('project_created', { project_type: projectType ?? undefined })

      await Promise.allSettled(
        members.map((m) =>
          inviteCollaborator(project.id, {
            email: m.email,
            role: JOB_TO_API[m.role] as InviteCollaboratorDto['role'],
          })
        )
      )

      router.push('/myproject')
    } catch {
      toast.error('등록 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-99">
      <div className="mx-auto max-w-[1200px] pt-10">
        <h1 className="text-head0_sb_52 mb-5">프로젝트 등록하기</h1>

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
                  onAddMember={addMember}
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
            onSubmit={() => setShowRegisterConfirm(true)}
            selectedCategories={selectedCategories}
            projectType={projectType}
            hasMember={members.length > 0}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={showRegisterConfirm}
        title="프로젝트를 등록하시겠습니까?"
        description="현재 작성하신 내용은 프로젝트 등록 후에도 수정이 가능해요."
        confirmLabel="등록할래요"
        onCancel={() => setShowRegisterConfirm(false)}
        onConfirm={() => {
          setShowRegisterConfirm(false)
          handleSubmit()
        }}
      />

      <LeaveConfirmModal
        isOpen={showLeaveModal}
        title="프로젝트 등록을 취소하고 이전 페이지로 돌아가시겠습니까?"
        description="프로젝트 등록 취소 후, 지금까지 작성한 정보는 복구가 불가합니다."
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => window.history.go(-2)}
      />
    </main>
  )
}
