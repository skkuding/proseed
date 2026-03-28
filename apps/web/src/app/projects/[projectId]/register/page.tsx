'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RoleFilterTabs } from '@/components/RoleTabs'
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
import { ConfirmModal } from '@/components/ConfirmModal'
import {
  CATEGORY_TO_API,
  STATUS_TO_API,
  JOB_TO_API,
  type JobTab,
  type Member,
  type ImageItem,
} from './_components/constants'

const API = 'http://localhost:4000'

async function uploadImage(file: File): Promise<string> {
  const res = await fetch(`${API}/storage/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  })
  const { url, key } = (await res.json()) as { url: string; key: string }
  await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
  return key
}

export default function RegisterProject() {
  const router = useRouter()
  const [tab, setTab] = useState<'basic' | 'image'>('basic')
  const [submitting, setSubmitting] = useState(false)
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)

  // 기본 정보
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [projectType, setProjectType] = useState<'APP' | 'WEB' | null>(null)
  const [title, setTitle] = useState('')
  const [projectLink, setProjectLink] = useState('')
  const [oneLineDescription, setOneLineDescription] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [contactPath, setContactPath] = useState('')

  // 팀원
  const leaderJobType: JobTab = '기획자'
  const [memberTab, setMemberTab] = useState<JobTab>('기획자')
  const [memberEmail, setMemberEmail] = useState('')
  const [members, setMembers] = useState<Member[]>([])

  // 이미지
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [projectImages, setProjectImages] = useState<ImageItem[]>([])

  // 완성 여부
  const basicDone = {
    category: selectedCategories.length > 0,
    type: projectType !== null,
    title: title.trim().length > 0,
    link: projectLink.trim().length > 0,
    description: oneLineDescription.trim().length >= 20 && description.trim().length >= 20,
    status: status !== null,
    contactPath: contactPath.trim().length > 0,
  }
  const imageDone = {
    icon: iconFile !== null,
    thumbnail: thumbnailFile !== null,
    projectImages: projectImages.length > 0,
  }
  const allBasicDone = Object.values(basicDone).every(Boolean)
  const allImageDone = Object.values(imageDone).every(Boolean)
  const canSubmit = allBasicDone && allImageDone

  function toggleCategory(label: string) {
    setSelectedCategories((prev) => {
      if (prev.includes(label)) return prev.filter((c) => c !== label)
      if (prev.length >= 2) return prev
      return [...prev, label]
    })
  }

  function addMember(member: { name: string; ownRole: string; profileImageUrl: string }) {
    const email = memberEmail.trim()
    if (!email || members.some((m) => m.email === email)) return
    setMembers((prev) => [...prev, { email, role: memberTab, ...member }])
    setMemberEmail('')
  }

  function handleIconSelect(file: File) {
    setIconFile(file)
    setIconPreview(URL.createObjectURL(file))
  }

  function handleThumbnailSelect(file: File) {
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  function handleAddProjectImages(files: FileList) {
    const remaining = 10 - projectImages.length
    const toAdd = Array.from(files)
      .slice(0, remaining)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setProjectImages((prev) => [...prev, ...toAdd])
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const [iconKey, thumbnailKey, ...imageKeys] = await Promise.all([
        uploadImage(iconFile!),
        uploadImage(thumbnailFile!),
        ...projectImages.map((img) => uploadImage(img.file)),
      ])

      const res = await fetch(`${API}/project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          type: projectType,
          status: STATUS_TO_API[status!],
          oneLineDescription,
          description,
          category: selectedCategories.map((c) => CATEGORY_TO_API[c]),
          contactPath,
          leaderJobType: JOB_TO_API[leaderJobType],
          projectLink,
          iconKey,
          thumbnailKey,
          imageKeys,
        }),
      })

      if (!res.ok) throw new Error()
      const project = await res.json()

      await Promise.allSettled(
        members.map((m) =>
          fetch(`${API}/project/${project.id}/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: m.email, role: JOB_TO_API[m.role] }),
          })
        )
      )

      router.push('/myproject')
    } catch (_) {
      toast.error('등록 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-99">
      <div className="mx-auto max-w-[1200px] pt-10">
        <h1 className="text-head0_sb_52 mb-5 ">프로젝트 등록하기</h1>

        {/* 탭 버튼 */}
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
          {/* 왼쪽 폼 */}
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

          {/* 오른쪽 사이드바 */}
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
    </main>
  )
}
