'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { FieldBadge } from '@/components/FieldBadge'
import { Button } from '@/components/ui/button'

export type ImageItem = {
  id: string
  preview: string
  uploading: boolean
  key: string | null
}

const MAX_IMAGES = 8

interface ImageUploadCardProps {
  images: ImageItem[]
  onFilesSelected: (files: FileList | null) => Promise<void>
  onImageClick: (index: number) => void
  isRequired?: boolean
  disabled?: boolean
}

export function ImageUploadCard({
  images,
  onFilesSelected,
  onImageClick,
  isRequired = true,
  disabled = false,
}: ImageUploadCardProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className={`flex flex-col gap-3 bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] ${disabled ? 'pointer-events-none' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-title1_sb_28">이미지 등록하기</h2>
          {isRequired && <FieldBadge type="필수" />}
        </div>

        <Button
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || images.length >= MAX_IMAGES}
          className="w-34.25 px-5 text-sub3_sb_16"
        >
          이미지 등록하기
        </Button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            await onFilesSelected(e.target.files)
            if (imageInputRef.current) imageInputRef.current.value = ''
          }}
        />
      </div>
      <p className="text-body3_r_16 text-CoolNeutral-40">
        해당 카테고리의 프로젝트 성장기록을 쉽게 이해할 수 있도록 이미지를 등록해주세요 (직군당 최대{' '}
        {MAX_IMAGES}장)
      </p>
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => onImageClick(index)}
              className="relative w-56.25 h-31.75 shrink-0 rounded-lg overflow-hidden hover:cursor-pointer"
            >
              <Image src={img.preview} alt="" fill className="object-cover" />
              {img.uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled}
          className="flex flex-col items-center justify-center gap-2 w-[225px] h-[127px] rounded-xl border border-dashed border-neutral-200 text-CoolNeutral-50 bg-neutral-99 not-disabled:hover:bg-neutral-95 not-disabled:hover:cursor-pointer transition-colors mt-1"
        >
          <ImageIcon className="size-6" />
          <span className="text-caption1_m_13">이미지 등록</span>
        </button>
      )}
    </div>
  )
}
