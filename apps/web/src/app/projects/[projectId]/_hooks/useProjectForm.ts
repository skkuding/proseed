'use client'

import { useState } from 'react'
import { type JobTab, type Member, type ImageItem } from '../register/_components/constants'

interface ProjectFormInit {
  categories?: string[]
  type?: 'APP' | 'WEB' | null
  title?: string
  projectLink?: string
  oneLineDescription?: string
  description?: string
  status?: string | null
  contactPath?: string
  iconPreview?: string | null
  thumbnailPreview?: string | null
  hasExistingImages?: boolean
}

export function useProjectForm(init: ProjectFormInit = {}) {
  // 기본 정보
  const [selectedCategories, setSelectedCategories] = useState<string[]>(init.categories ?? [])
  const [projectType, setProjectType] = useState<'APP' | 'WEB' | null>(init.type ?? null)
  const [title, setTitle] = useState(init.title ?? '')
  const [projectLink, setProjectLink] = useState(init.projectLink ?? '')
  const [oneLineDescription, setOneLineDescription] = useState(init.oneLineDescription ?? '')
  const [description, setDescription] = useState(init.description ?? '')
  const [status, setStatus] = useState<string | null>(init.status ?? null)
  const [contactPath, setContactPath] = useState(init.contactPath ?? '')

  // 팀원
  const [memberTab, setMemberTab] = useState<JobTab>('기획자')
  const [memberEmail, setMemberEmail] = useState('')
  const [members, setMembers] = useState<Member[]>([])

  // 이미지
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(init.iconPreview ?? null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    init.thumbnailPreview ?? null
  )
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
    icon: !!iconPreview,
    thumbnail: !!thumbnailPreview,
    projectImages: projectImages.length > 0 || (init.hasExistingImages ?? false),
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

  return {
    // 기본 정보 state
    selectedCategories,
    setSelectedCategories,
    projectType,
    setProjectType,
    title,
    setTitle,
    projectLink,
    setProjectLink,
    oneLineDescription,
    setOneLineDescription,
    description,
    setDescription,
    status,
    setStatus,
    contactPath,
    setContactPath,
    // 팀원 state
    memberTab,
    setMemberTab,
    memberEmail,
    setMemberEmail,
    members,
    setMembers,
    // 이미지 state
    iconFile,
    iconPreview,
    thumbnailFile,
    thumbnailPreview,
    projectImages,
    setProjectImages,
    // 완성 여부
    basicDone,
    imageDone,
    allBasicDone,
    allImageDone,
    canSubmit,
    // 핸들러
    toggleCategory,
    addMember,
    handleIconSelect,
    handleThumbnailSelect,
    handleAddProjectImages,
  }
}
