import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description?: string
  cancelLabel?: string
  confirmLabel?: string
  cancelButtonClassName?: string
  confirmButtonClassName?: string
  // 생략하면 취소 버튼 없이 확인 버튼 하나만 렌더링
  onCancel?: () => void
  onConfirm: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  cancelLabel = '취소',
  confirmLabel = '확인했어요',
  cancelButtonClassName,
  confirmButtonClassName,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel ?? onConfirm}
    >
      <div
        className="w-100 bg-white rounded-[12px] p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3">
          <Image src="/info_cool30.svg" alt="info" width={24} height={24} />
          <div className="flex flex-col gap-2">
            <p className="text-title5_sb_20 text-black">{title}</p>
            {description && <p className="text-body2_m_14 text-CoolNeutral-30">{description}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-1">
          {onCancel && (
            <Button
              variant="outline"
              size="xs"
              onClick={onCancel}
              className={cn('w-25 text-sub4_sb_14', cancelButtonClassName)}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            size="xs"
            onClick={onConfirm}
            className={cn('w-25 text-sub4_sb_14', confirmButtonClassName)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
