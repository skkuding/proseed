import { ConfirmModal } from './ConfirmModal'

interface MemberDeleteModalProps {
  isOpen: boolean
  name: string
  // 삭제 대상이 리드(본인) 본인일 때 — 삭제 대신 안내만 하고 실제 삭제는 막는다
  isLead?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function MemberDeleteModal({
  isOpen,
  name,
  isLead = false,
  onCancel,
  onConfirm,
}: MemberDeleteModalProps) {
  if (isLead) {
    return (
      <ConfirmModal
        isOpen={isOpen}
        title="리드는 팀원 목록에서 제외될 수 없어요"
        description="리드 권한을 위임하는 기능은 아직 지원하지 않아요."
        confirmLabel="확인했어요"
        onConfirm={onCancel}
      />
    )
  }

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
