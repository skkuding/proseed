'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { ConfirmModal } from '@/components/ConfirmModal'
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
import { useProjectForm } from '../_hooks/useProjectForm'
import mockData from '@/app/_mockdata/project-detail/project-basicdata.json'

const API_TO_STATUS = Object.fromEntries(
  Object.entries(STATUS_TO_API).map(([label, api]) => [api, label])
)

const { mockProject } = mockData

export default function EditMyProject() {
  const router = useRouter()
  const [tab, setTab] = useState<'basic' | 'image'>('basic')
  const [submitting, setSubmitting] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

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
    categories: mockProject.category.map((c) => CATEGORY_LABELS[c] ?? c),
    type: mockProject.type as 'APP' | 'WEB',
    title: mockProject.title,
    projectLink: mockProject.projectLink,
    oneLineDescription: mockProject.oneLineDescription,
    description: mockProject.description,
    status: API_TO_STATUS[mockProject.status] ?? null,
    contactPath: mockProject.contactPath,
    iconPreview: mockProject.iconUrl,
    thumbnailPreview: mockProject.thumbnailUrl,
    hasExistingImages: mockProject.images.length > 0,
  })

  async function handleSave() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      // TODO: 백엔드 연결 시 아래 주석 해제
      // const projectId = mockProject.id
      // await fetch(`${API}/project/${projectId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ title, type: projectType, status: STATUS_TO_API[status!], ... }),
      // })
      toast.success('프로젝트가 수정되었습니다.')
      router.push('/myproject')
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
    </main>
  )
}
