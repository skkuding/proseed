'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import projects from '@/app/_mockdata/project-list/recent-projects.json'

interface GrowthRecordSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  ticketCount?: number
  projectId: string | string[]
}

const VISIBLE_COUNT = 3
const MAX_PROJECTS = 5

export function GrowthRecordSuccessModal({
  isOpen,
  onClose,
  ticketCount = 2,
  projectId,
}: GrowthRecordSuccessModalProps) {
  const router = useRouter()
  const [startIndex, setStartIndex] = useState(0)

  if (!isOpen) return null

  const CARD_WIDTH = 336
  const CARD_GAP = 12
  const offset = startIndex * (CARD_WIDTH + CARD_GAP)

  const displayProjects = projects.slice(0, MAX_PROJECTS)

  const canPrev = startIndex > 0
  const canNext = startIndex + VISIBLE_COUNT <= displayProjects.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-220 h-148 bg-background-normal rounded-2xl py-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 px-7">
          <h2 className="text-head3_sb_36">성공적으로 성장기록과 피드백 질문을 업로드했어요!</h2>
          <button
            onClick={onClose}
            className="text-CoolNeutral-40 hover:text-CoolNeutral-20 hover:cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Carousel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-title3_sb_24 px-7">이런 프로젝트는 어떠세요?</p>
            <div className="flex gap-1">
              <button
                onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
                disabled={!canPrev}
                className="size-8 flex items-center justify-center rounded-full border border-neutral-200 text-CoolNeutral-40 disabled:opacity-30 hover:bg-neutral-99 hover:cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() =>
                  setStartIndex((i) => Math.min(displayProjects.length - VISIBLE_COUNT + 1, i + 1))
                }
                disabled={!canNext}
                className="size-8 flex items-center justify-center rounded-full border border-neutral-200 text-CoolNeutral-40 disabled:opacity-30 hover:bg-neutral-99 hover:cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex gap-3 transition-transform duration-300 ease-in-out px-7 pt-2 pb-8"
              style={{ transform: `translateX(-${offset}px)` }}
            >
              {displayProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  style={{ width: 336, height: 305 }}
                  className="flex flex-col shrink-0 p-2 pb-5 rounded-xl bg-white overflow-hidden shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] text-left hover:shadow-lg hover:cursor-pointer transition-shadow"
                >
                  <div className="relative w-full flex-1 min-h-0">
                    <Image
                      src={project.thumbnailUrl}
                      alt={project.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 h-26.25 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sub3_sb_16 text-CoolNeutral-20">{project.title}</span>
                      <span className="text-caption1_m_13 text-CoolNeutral-40 px-2 py-1 bg-neutral-99 rounded">
                        {project.category[0]}
                      </span>
                    </div>
                    <p className="text-body2_m_14 text-CoolNeutral-40 line-clamp-2">
                      {project.oneLineDescription}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 px-7">
          <button
            onClick={() => router.push('/')}
            className="h-13 w-[140px] rounded-xl border border-neutral-200 text-sub3_sb_16 text-CoolNeutral-20 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
          >
            홈 화면 바로가기
          </button>
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="h-13 w-[179px] rounded-xl bg-CoolNeutral-20 text-sub3_sb_16 text-white hover:bg-CoolNeutral-30 hover:cursor-pointer transition-colors"
          >
            작성된 성장기록 바로가기
          </button>
        </div>
      </div>
    </div>
  )
}
