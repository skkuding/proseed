'use client'

import Image from 'next/image'
import Link from 'next/link'

export type ParticipatedProject = {
  id: number
  title: string
  role: string
  description: string
  href: string
  imageUrl: string
}

export function ParticipatedProjectCard({ project }: { project: ParticipatedProject }) {
  return (
    <Link
      href={project.href}
      className="group flex items-center rounded-[16px] bg-white p-5 gap-10 justify-between shadow-[0_4px_12px_0_rgba(27,29,38,0.06)] transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-15 w-15 overflow-hidden rounded-[16px] bg-[#F8F9FB]">
          <Image
            src={project.imageUrl}
            alt={`${project.title} 대표 이미지`}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-title1_sb_28 text-black">{project.title}</p>
          <p className="text-body2_m_14 text-neutral-40">{project.description}</p>
        </div>
      </div>
      <button
        type="button"
        className="rounded-[8px] border-[1.4px] border-CoolNeutral-50 bg-white px-5 py-[13px] text-sub3_sb_16 text-black"
      >
        바로가기
      </button>
    </Link>
  )
}
