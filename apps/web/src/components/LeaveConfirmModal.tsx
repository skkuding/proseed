import { ConfirmModal } from './ConfirmModal'

interface LeaveConfirmModalProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function LeaveConfirmModal({ isOpen, onCancel, onConfirm }: LeaveConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title="이전 페이지로 돌아가시겠습니까?"
      description="지금까지 작성한 정보는 복구가 불가합니다."
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
