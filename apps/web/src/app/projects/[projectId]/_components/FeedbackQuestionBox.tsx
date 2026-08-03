'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldBadge } from '@/components/FieldBadge'
import Editor from '@/components/mdxEditor/Editor'
import type { FeedbackQuestionItemDto } from '@/lib/api'

export const MAX_QUESTION_IMAGES = 8

export type QuestionImageItem = {
  id: string
  preview: string
  key?: string
  uploading: boolean
}

interface FeedbackQuestionBoxProps {
  question: FeedbackQuestionItemDto
  answer: string
  onAnswerChange: (value: string) => void
  images: QuestionImageItem[]
  onImageSelect: (files: FileList | null) => void
  onImageClick: (index: number) => void
  boxRef?: (el: HTMLDivElement | null) => void
}

export function FeedbackQuestionBox({
  question,
  answer,
  onAnswerChange,
  images,
  onImageSelect,
  onImageClick,
  boxRef,
}: FeedbackQuestionBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      ref={boxRef}
      className="flex flex-col gap-3 bg-white rounded-[12px] p-7 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-title1_sb_28 min-w-0 flex-1">{question.title}</h2>
        {question.required && <FieldBadge type="필수" />}
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= MAX_QUESTION_IMAGES}
          className="w-34.25 shrink-0 px-5 text-sub3_sb_16"
        >
          이미지 등록하기
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onImageSelect(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      <Editor markdown={answer} onChange={onAnswerChange} width="100%" height={252} />
      {images.length > 0 ? (
        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => onImageClick(index)}
              className="relative aspect-video w-full rounded-lg overflow-hidden hover:cursor-pointer"
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
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 w-56.25 h-31.75 rounded-xl border border-dashed border-neutral-200 text-CoolNeutral-50 bg-neutral-99 hover:bg-neutral-95 hover:cursor-pointer transition-colors"
        >
          <ImageIcon className="size-6" />
          <span className="text-caption1_m_13">이미지 등록</span>
        </button>
      )}
    </div>
  )
}
