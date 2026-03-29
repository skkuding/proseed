import { useRef } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface ThumbnailSectionProps {
  preview: string | null
  onSelect: (file: File) => void
}

export function ThumbnailSection({ preview, onSelect }: ThumbnailSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-2">
            <h2 className="text-title1_sb_28">썸네일 이미지</h2>
            <span className="text-primary-strong text-caption1_m_16 bg-primary-light rounded-[4px] px-2 py-1">
              필수
            </span>
          </div>
          <p className="text-body3_r_16 text-CoolNeutral-30">
            탐색하기, 내 프로젝트 탭에서 보여질 썸네일 이미지를 등록해주세요
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 h-10 px-4 rounded-[8px] text-sub3_sb_16 bg-CoolNeutral-20 text-white hover:bg-CoolNeutral-30 cursor-pointer transition-colors"
        >
          이미지 등록하기
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onSelect(f)
            e.target.value = ''
          }}
        />
      </div>

      {/* 이미지 박스 */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative w-[225px] h-[127px] rounded-[8px] border bg-neutral-99 flex flex-col items-center justify-center overflow-hidden hover:border-CoolNeutral-50 transition-colors hover:cursor-pointer ${preview ? 'border-neutral-90' : 'border-dashed border-neutral-90'}`}
      >
        {preview ? (
          <Image src={preview} alt="썸네일" fill className="object-cover" />
        ) : (
          <>
            <ImageIcon className="size-10 text-CoolNeutral-70 mb-1" />
            <span className="text-sub4_sb_14 text-CoolNeutral-50">이미지 등록</span>
          </>
        )}
      </button>

      <ul className="rounded-[12px] bg-neutral-99 border-neutral-95 border-[1.4px] p-5 gap-0.5 flex flex-col text-body1_m_16 text-CoolNeutral-20">
        <li>• 1920×1080 사이즈의 이미지를 업로드 해주세요. (최대 용량 20mb)</li>
        <li>• 최대 1장까지 업로드 가능합니다.</li>
        <li>• PNG와 JPEG 형식의 이미지만 업로드 가능합니다.</li>
      </ul>
    </section>
  )
}
