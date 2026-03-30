import Image from 'next/image'
import info from '../../public/info.svg'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description?: string
  cancelLabel?: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  cancelLabel = '취소',
  confirmLabel = '확인했어요',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-96 bg-white rounded-2xl p-8 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3">
          <Image src={info} alt="info" width={24} height={24} />
          <div className="flex flex-col gap-2">
            <p className="text-title5_sb_20 text-CoolNeutral-20">{title}</p>
            {description && <p className="text-body2_m_14 text-CoolNeutral-40">{description}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="w-25 h-10 rounded-lg border-[1.4px] border-CoolNeutral-50 text-sub4_sb_14 text-CoolNeutral-20 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="w-25 h-10 rounded-lg bg-CoolNeutral-20 text-sub4_sb_14 text-white hover:bg-CoolNeutral-30 hover:cursor-pointer transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
