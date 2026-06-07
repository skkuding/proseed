'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const PROFILE_OPTIONS = [
  { src: '/profile_salmonsushi.svg', label: '연어초밥' },
  { src: '/profile_tunasushi.svg', label: '참치초밥' },
  { src: '/profile_shrimp.svg', label: '새우튀김' },
  { src: '/Profile_onikiri.svg', label: '주먹밥' },
  { src: '/profile_maple.svg', label: '단풍잎' },
  { src: '/profile_juice.svg', label: '사과주스' },
  { src: '/Profile_fortunecookie.svg', label: '포츈쿠키' },
  { src: '/Profile_fish.svg', label: '물고기' },
  { src: '/profile_cake.svg', label: '케이크' },
  { src: '/profile_avocado.svg', label: '아보카도' },
]

export const PROFILE_SRCS = PROFILE_OPTIONS.map((o) => o.src)

interface ProfileImageModalProps {
  isOpen: boolean
  currentImage: string
  onClose: () => void
  onConfirm: (src: string) => Promise<void>
}

export function ProfileImageModal({
  isOpen,
  currentImage,
  onClose,
  onConfirm,
}: ProfileImageModalProps) {
  const [selected, setSelected] = useState(currentImage)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) setSelected(currentImage)
  }, [isOpen, currentImage])

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsSaving(true)
    try {
      await onConfirm(selected)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[680px] rounded-2xl bg-white px-10 py-10">
        {/* div1: 제목 */}
        <div className="flex items-center justify-between">
          <h2 className="text-head3_sb_36 text-CoolNeutral-20">프로필 이미지 변경하기</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-40 hover:text-CoolNeutral-20 hover:cursor-pointer"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* div2: 이미지 그리드 */}
        <div className="mt-5 rounded-2xl bg-neutral-99 px-7 py-6">
          <div className="grid grid-cols-5 gap-5">
            {PROFILE_OPTIONS.map(({ src, label }) => (
              <button
                key={src}
                type="button"
                onClick={() => setSelected(src)}
                className="flex flex-col items-center gap-2 hover:cursor-pointer"
              >
                <div
                  className={`rounded-full p-[13px] transition-all ${
                    selected === src ? 'ring-[3px] ring-primary' : ''
                  }`}
                >
                  <Image src={src} width={64} height={64} alt={label} />
                </div>
                <span className="text-sub3_sb_16 text-CoolNeutral-20">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* div3: 버튼 */}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-auto rounded-[8px] border-neutral-90 px-5 py-[15px] text-sub3_sb_16 text-CoolNeutral-20 hover:cursor-pointer"
          >
            취소하기
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSaving}
            className="h-auto rounded-[8px] bg-CoolNeutral-20 px-5 py-[15px] text-sub3_sb_16 text-white hover:cursor-pointer disabled:opacity-60"
          >
            이미지 변경하기
          </Button>
        </div>
      </div>
    </div>
  )
}
