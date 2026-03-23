'use client'

import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, Trash2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  images: { previewUrl: string }[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onDelete: () => void
}

export function ImageDeleteModal({
  isOpen,
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onDelete,
}: Props) {
  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
      onClick={onClose}
    >
      {/* Image + nav */}
      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onPrev}
          className="size-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 hover:cursor-pointer transition-colors"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
        <div className="relative w-175 h-100 rounded-2xl overflow-hidden">
          <Image src={currentImage.previewUrl} alt="" fill className="object-contain" />
        </div>
        <button
          onClick={onNext}
          className="size-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 hover:cursor-pointer transition-colors"
        >
          <ChevronRightIcon className="size-6" />
        </button>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="mt-4 flex w-225 justify-center h-13 items-center gap-2 px-6 py-3.5 bg-white rounded-lg text-CoolNeutral-20 text-sub3_sb_16 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
      >
        <Trash2 className="size-4" />
        이미지 삭제하기
      </button>
    </div>
  )
}
