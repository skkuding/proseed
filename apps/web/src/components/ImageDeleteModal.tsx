'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ConfirmModal } from './ConfirmModal'

interface Props {
  isOpen: boolean
  images: { preview: string }[]
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
  const [showConfirm, setShowConfirm] = useState(false)

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-lg"
      onClick={onClose}
    >
      {/* Image + nav */}
      <div
        className="flex items-center justify-between gap-16"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onPrev}
          className="size-10 flex items-center justify-center hover:cursor-pointer"
        >
          <Image src="/arrow2_left.svg" alt="이전" width={24} height={24} />
        </button>
        <div className="relative w-[900px] h-[504px] rounded-2xl overflow-hidden">
          <Image src={currentImage.preview} alt="" fill className="object-contain" />
        </div>
        <button
          onClick={onNext}
          className="size-10 flex items-center justify-center hover:cursor-pointer"
        >
          <Image src="/arrow2_right.svg" alt="다음" width={24} height={24} />
        </button>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowConfirm(true)
        }}
        className="mt-4 flex w-[900px] justify-center h-13 items-center gap-2 px-6 py-3.5 bg-white rounded-lg text-CoolNeutral-20 text-sub3_sb_16 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
      >
        <Image src="/trash_fill.svg" alt="삭제" width={20} height={20} />
        이미지 삭제하기
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        title="삭제하시겠습니까?"
        description="삭제한 이미지는 다시 등록할 수 있습니다."
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          onDelete()
          setShowConfirm(false)
        }}
      />
    </div>
  )
}
