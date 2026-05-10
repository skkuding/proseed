import { Info } from 'lucide-react'
import info from '../../public/info_cool30.svg'
import Image from 'next/image'

interface LeaveConfirmModalProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function LeaveConfirmModal({ isOpen, onCancel, onConfirm }: LeaveConfirmModalProps) {
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
            <p className="text-title5_sb_20 text-CoolNeutral-20 whitespace-pre-line">
              {'이전 페이지로 돌아가시겠습니까?'}
            </p>
            <p className="text-body2_m_14 text-CoolNeutral-40">
              지금까지 작성한 정보는 복구가 불가합니다.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="w-25 h-10 rounded-lg border-[1.4px] border-CoolNeutral-50 text-sub4_sb_14 text-CoolNeutral-20 hover:bg-neutral-99 hover:cursor-pointer transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="w-25 h-10 rounded-lg bg-CoolNeutral-20 text-sub4_sb_14 text-white hover:bg-CoolNeutral-30 hover:cursor-pointer transition-colors"
          >
            확인했어요
          </button>
        </div>
      </div>
    </div>
  )
}
