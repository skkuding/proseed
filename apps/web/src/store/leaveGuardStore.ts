import { create } from 'zustand'

// useLeaveGuard가 마운트된 페이지(성장기록 작성/프로젝트 등록·수정/피드백 작성)가 있는 동안
// isActive=true — Header 등 페이지 바깥의 내비게이션(상단 탭, 로그아웃)이 이 값을 보고
// 곧장 이동하는 대신 확인 모달을 띄울지 판단한다. 실제 이동/로그아웃 동작은 pendingAction으로
// 넘겨받아, 모달을 렌더링하는 쪽(각 페이지의 LeaveConfirmModal)이 confirm 시 실행한다.
interface LeaveGuardStore {
  isActive: boolean
  showModal: boolean
  pendingAction: (() => void) | null
  activate: () => void
  deactivate: () => void
  requestLeave: (action: () => void) => void
  confirm: () => void
  cancel: () => void
}

export const useLeaveGuardStore = create<LeaveGuardStore>((set, get) => ({
  isActive: false,
  showModal: false,
  pendingAction: null,
  activate: () => set({ isActive: true }),
  deactivate: () => set({ isActive: false, showModal: false, pendingAction: null }),
  requestLeave: (action) => set({ showModal: true, pendingAction: action }),
  confirm: () => {
    const action = get().pendingAction
    set({ showModal: false, pendingAction: null })
    action?.()
  },
  cancel: () => set({ showModal: false, pendingAction: null }),
}))
