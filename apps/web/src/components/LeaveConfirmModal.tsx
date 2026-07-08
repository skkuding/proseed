import { ConfirmModal } from './ConfirmModal'

interface LeaveConfirmModalProps {
  isOpen: boolean
  title?: string
  description?: string
  onCancel: () => void
  onConfirm: () => void
}

export function LeaveConfirmModal({
  isOpen,
  title = '이전 페이지로 돌아가시겠습니까?',
  description = '지금까지 작성한 정보는 복구가 불가합니다.',
  onCancel,
  onConfirm,
}: LeaveConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title={title}
      description={description}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
