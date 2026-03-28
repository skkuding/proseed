'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { XIcon, ChevronRightIcon } from 'lucide-react'
import navigateProjects from '@/app/_mockdata/project-list/navigate-projects.json'

const STORAGE_KEY = 'proseed_recent_projects'
const MAX_RECENT = 3

type Project = (typeof navigateProjects)[number]

function getRecentProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    const ids: number[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return ids.map((id) => navigateProjects.find((p) => p.id === id)).filter(Boolean) as Project[]
  } catch {
    return []
  }
}

export function saveRecentProject(projectId: number) {
  if (typeof window === 'undefined') return
  try {
    const ids: number[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    const updated = [projectId, ...ids.filter((id) => id !== projectId)].slice(0, MAX_RECENT)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (_) {
    // ignore
  }
}

function highlightText(text: string, keyword: string) {
  const idx = text.indexOf(keyword)
  if (!keyword || idx === -1) return <span>{text}</span>
  return (
    <>
      <span>{text.slice(0, idx)}</span>
      <span className="text-primary-strong">{text.slice(idx, idx + keyword.length)}</span>
      <span>{text.slice(idx + keyword.length)}</span>
    </>
  )
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setRecentProjects(getRecentProjects())
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const trimmedQuery = query.trim()
  const matchedProjects = trimmedQuery
    ? navigateProjects.filter((p) => p.title.toLowerCase().includes(trimmedQuery.toLowerCase()))
    : []

  const handleProjectClick = (project: Project) => {
    saveRecentProject(project.id)
    onClose()
    window.location.href = `/projects/${project.id}`
  }

  const handleClearAll = () => {
    localStorage.removeItem(STORAGE_KEY)
    setRecentProjects([])
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-[800px] rounded-[20px] bg-background-normal">
        <div className="flex flex-col gap-5 px-7 py-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-head3_sb_36">프로젝트 검색</h3>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 hover:cursor-pointer"
              aria-label="닫기"
            >
              <XIcon className="size-[21px] text-neutral-30" />
            </button>
          </div>

          {/* Search input + dropdown */}
          <div className="relative">
            <div className="flex items-center rounded-full border-[1.4px] border-black px-6 py-3">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="프로젝트명을 검색해보세요"
                className="flex-1 text-body3_r_16 text-black placeholder:text-CoolNeutral-60 outline-none bg-transparent"
              />
              <Image src="/search.svg" alt="검색" width={24} height={24} />
            </div>

            {trimmedQuery !== '' && (
              <div className="absolute left-0 right-0 top-full mt-2 z-20 h-[150px] overflow-y-auto rounded-xl bg-background-normal shadow-[0_4px_20px_0_rgba(0,0,0,0.12)] border border-neutral-200">
                {matchedProjects.length > 0 ? (
                  matchedProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectClick(project)}
                      className="flex items-center w-full h-[50px] px-5 py-3 text-left text-body1_m_16 text-CoolNeutral-20 hover:bg-neutral-99 transition-colors hover:cursor-pointer"
                    >
                      {highlightText(project.title, trimmedQuery)}
                    </button>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full gap-2 text-CoolNeutral-50">
                    <Image src="/info.svg" alt="정보" width={16} height={16} />
                    <p className="text-body3_r_16">검색 결과가 없습니다</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 최근 조회한 프로젝트 */}
          <div className="flex flex-col gap-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-title5_sb_20">최근 조회한 프로젝트</span>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-0.5 text-body2_m_14 text-CoolNeutral-40 hover:text-CoolNeutral-20 transition-colors hover:cursor-pointer"
              >
                전체 삭제
                <ChevronRightIcon className="size-4" />
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-CoolNeutral-50">
                <Image src="/info.svg" alt="정보" width={20} height={20} />
                <p className="text-body3_r_16">최근에 조회한 프로젝트가 없습니다</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="flex items-center gap-4 p-4 rounded-[12px] bg-white hover:cursor-pointer"
                  >
                    <div className="relative h-15 w-15 rounded-[8px] overflow-hidden shrink-0">
                      <Image
                        src={project.thumbnailUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-sub1_sb_18 text-CoolNeutral-20">{project.title}</span>
                        {project.category.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center rounded-[4px] bg-neutral-99 px-2 py-1 text-caption1_m_13 text-CoolNeutral-40"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <p className="text-body4_r_14 text-CoolNeutral-30 truncate w-full text-left">
                        {project.oneLineDescription}
                      </p>
                    </div>
                    <ChevronRightIcon className="size-7 text-neutral-40 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
