'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import type { ImageItem } from './constants'
import { ImageDeleteModal } from '@/components/ImageDeleteModal'

interface ProjectImagesSectionProps {
  images: ImageItem[]
  onAdd: (files: FileList) => void
  onRemove: (idx: number) => void
}

export function ProjectImagesSection({ images, onAdd, onRemove }: ProjectImagesSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [viewingIdx, setViewingIdx] = useState<number | null>(null)

  const handleDelete = () => {
    if (viewingIdx === null) return
    onRemove(viewingIdx)
    if (images.length <= 1) {
      setViewingIdx(null)
    } else {
      setViewingIdx(Math.min(viewingIdx, images.length - 2))
    }
  }

  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-2">
            <h2 className="text-title1_sb_28">프로젝트 이미지</h2>
            <span className="text-primary-strong text-caption1_m_16 bg-primary-light rounded-[4px] px-2 py-1">
              필수
            </span>
          </div>
          <p className="text-body3_r_16 text-CoolNeutral-30">
            프로젝트를 나타낼 수 있는 이미지를 등록해주세요
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={images.length >= 10}
          className={`shrink-0 h-10 px-4 rounded-[8px] text-sub3_sb_16 transition-colors ${
            images.length >= 10
              ? 'bg-neutral-200 text-CoolNeutral-60 cursor-not-allowed'
              : 'bg-CoolNeutral-20 text-white hover:bg-CoolNeutral-30 cursor-pointer'
          }`}
        >
          이미지 등록하기
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onAdd(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {/* 이미지 박스 */}
      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative w-[225px] h-[127px] rounded-[8px] border border-dashed border-neutral-90 bg-neutral-99 flex flex-col items-center justify-center overflow-hidden hover:border-CoolNeutral-50 transition-colors hover:cursor-pointer"
        >
          <ImageIcon className="size-10 text-CoolNeutral-70 mb-1" />
          <span className="text-sub4_sb_14 text-CoolNeutral-50">이미지 등록</span>
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setViewingIdx(idx)}
              className="relative h-[100px] rounded-[8px] border border-neutral-90 overflow-hidden bg-gray-100 hover:cursor-pointer"
            >
              <Image src={img.preview} alt={`이미지 ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <ul className="rounded-[12px] bg-neutral-99 border-neutral-95 border-[1.4px] p-5 gap-0.5 flex flex-col text-body1_m_16 text-CoolNeutral-20">
        <li>• 1920×1080 사이즈의 이미지를 업로드 해주세요. (개당 최대 용량 20mb)</li>
        <li>• 최대 10장까지 업로드 가능합니다.</li>
        <li>• PNG와 JPEG 형식의 이미지만 업로드 가능합니다.</li>
      </ul>

      <ImageDeleteModal
        isOpen={viewingIdx !== null}
        images={images}
        currentIndex={viewingIdx ?? 0}
        onClose={() => setViewingIdx(null)}
        onPrev={() => setViewingIdx((i) => ((i ?? 0) - 1 + images.length) % images.length)}
        onNext={() => setViewingIdx((i) => ((i ?? 0) + 1) % images.length)}
        onDelete={handleDelete}
      />
    </section>
  )
}
