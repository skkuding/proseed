'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProjects, type Project } from '@/lib/api'
import { CATEGORY_LABELS } from '@/app/_utils/projectConstants'

interface GrowthRecordSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | string[]
}

const VISIBLE_COUNT = 3
const MAX_PROJECTS = 5

export function GrowthRecordSuccessModal({
  isOpen,
  onClose,
  projectId,
}: GrowthRecordSuccessModalProps) {
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
        className="w-220 h-148 bg-background-normal rounded-2xl py-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 px-7">
          <h2 className="text-head3_sb_36">성공적으로 성장기록과 피드백 질문을 업로드했어요!</h2>
          <Button variant="iconMuted" size="bare" onClick={onClose}>
            <X className="size-6" />
          </Button>
        </div>

        {/* Carousel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-title3_sb_24 px-7">이런 프로젝트는 어떠세요?</p>
            <div className="flex gap-1 pr-7">
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
              className="flex gap-3 transition-transform duration-300 ease-in-out px-7 pt-2 pb-8"
              style={{ transform: `translateX(-${offset}px)` }}
            >
              {displayProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  style={{ width: 336, height: 305 }}
                  className="flex flex-col shrink-0 p-2 pb-5 rounded-xl gap-2 bg-white overflow-hidden shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] text-left hover:shadow-lg hover:cursor-pointer transition-shadow"
                >
                  <div className="relative w-full flex-1 min-h-0">
                    <Image
                      src={project.thumbnailUrl}
                      alt={project.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1 px-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-title3_sb_24">{project.title}</span>
                      <span className="text-body1_m_16 text-CoolNeutral-40 px-2 py-1 bg-neutral-99 rounded-[4px]">
                        {CATEGORY_LABELS[project.category[0]] ?? project.category[0]}
                      </span>
                    </div>
                    <p className="text-body3_r_16 text-CoolNeutral-30 line-clamp-2 h-13">
                      {project.oneLineDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 px-7">
          <Button asChild variant="outline" size="lg" className="w-[140px] text-sub3_sb_16">
            <Link href="/">홈 화면 바로가기</Link>
          </Button>
          <Button asChild size="lg" className="w-[179px] text-sub3_sb_16">
            <Link href={`/projects/${projectId}`}>작성된 성장기록 바로가기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
