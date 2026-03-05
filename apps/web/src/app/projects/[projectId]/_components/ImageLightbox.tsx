'use client'

import Image from 'next/image'
import { useEffect, useCallback } from 'react'
import arrowLeft from '../../../../../public/arrow2_left.svg'
import arrowRight from '../../../../../public/arrow2_right.svg'

interface Props {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export function ImageLightbox({ images, currentIndex, isOpen, onClose, onPrev, onNext }: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
      else if (e.key === 'Escape') onClose()
    },
    [isOpen, onPrev, onNext, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Prev button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        className="absolute left-8 flex size-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors hover:cursor-pointer"
      >
        <Image src={arrowLeft} alt="이전" width={24} height={24} />
      </button>

      {/* Image card + dot indicator */}
      <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <Image
            src={images[currentIndex]}
            alt=""
            width={1200}
            height={800}
            className="min-w-225 max-w-full min-h-126 max-h-full w-auto h-auto object-contain"
          />
        </div>

        {images.length > 1 && (
          <div className="flex gap-1.5">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`block size-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Next button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        className="absolute right-8 flex size-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors hover:cursor-pointer"
      >
        <Image src={arrowRight} alt="다음" width={24} height={24} />
      </button>
    </div>
  )
}
