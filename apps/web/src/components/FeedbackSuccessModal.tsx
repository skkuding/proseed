'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getProjects, type Project } from '@/lib/api'
import { CATEGORY_LABELS } from '@/app/_utils/projectConstants'

interface FeedbackSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | string[]
}

const VISIBLE_COUNT = 3
const MAX_PROJECTS = 5

export function FeedbackSuccessModal({ isOpen, onClose, projectId }: FeedbackSuccessModalProps) {
  const router = useRouter()
  const [startIndex, setStartIndex] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    if (!isOpen) return
    getProjects({ take: MAX_PROJECTS })
      .then((res) => setProjects(res.data))
      .catch(() => setProjects([]))
  }, [isOpen])

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
        className="w-220 h-148 bg-background-normal rounded-[20px] py-10 flex flex-col px-7 gap-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <h2 className="text-head3_sb_36">피드백을 등록했어요!</h2>
          <Button variant="iconMuted" size="bare" onClick={onClose}>
            <X className="size-9 text-neutral-30" />
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-title3_sb_24">이런 프로젝트는 어떠세요?</p>
            <div className="flex gap-3">
              <Button
                variant="iconCircle"
                size="icon-sm"
                onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
                disabled={!canPrev}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="iconCircle"
                size="icon-sm"
                onClick={() =>
                  setStartIndex((i) => Math.min(displayProjects.length - VISIBLE_COUNT + 1, i + 1))
                }
                disabled={!canNext}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex gap-3 transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${offset}px)` }}
            >
              {displayProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  style={{ width: 336, height: 305 }}
                  className="flex flex-col shrink-0 p-2 pb-5 gap-2 rounded-[20px] bg-white overflow-hidden shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] text-left hover:shadow-lg hover:cursor-pointer transition-shadow"
                >
                  <div className="relative w-full flex-1 min-h-0">
                    <Image
                      src={project.thumbnailUrl}
                      alt={project.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1 px-2 h-26.25 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-title3_sb_24">{project.title}</span>
                      <span className="text-body1_m_16 text-CoolNeutral-40 px-2 py-1 bg-neutral-99 rounded-[4px]">
                        {CATEGORY_LABELS[project.category[0]] ?? project.category[0]}
                      </span>
                    </div>
                    <p className="text-body3_r_16 text-CoolNeutral-30 line-clamp-2">
                      {project.oneLineDescription}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-7">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/')}
            className="w-[140px] text-sub3_sb_16"
          >
            홈 화면 바로가기
          </Button>
          <Button
            size="lg"
            onClick={() => router.push(`/projects/${projectId}/feedback`)}
            className="w-[179px] text-sub3_sb_16"
          >
            작성된 피드백 바로가기
          </Button>
        </div>
      </div>
    </div>
  )
}
