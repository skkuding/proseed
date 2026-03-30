import { ConfirmModal } from './ConfirmModal'

interface MemberDeleteModalProps {
  isOpen: boolean
  name: string
  onCancel: () => void
  onConfirm: () => void
}

export function MemberDeleteModal({ isOpen, name, onCancel, onConfirm }: MemberDeleteModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title={`${name}님을 삭제하시겠습니까?`}
      description="팀원 목록에서 제거됩니다."
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
