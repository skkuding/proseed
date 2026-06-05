import { create } from 'zustand'

interface AuthStore {
  isLoginModalOpen: boolean
  isOnboardingModalOpen: boolean
  onboardingNickname: string
  openLoginModal: () => void
  closeLoginModal: () => void
  openOnboardingModal: (nickname: string) => void
  closeOnboardingModal: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoginModalOpen: false,
  isOnboardingModalOpen: false,
  onboardingNickname: '',
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  openOnboardingModal: (nickname) =>
    set({ isOnboardingModalOpen: true, onboardingNickname: nickname }),
  closeOnboardingModal: () => set({ isOnboardingModalOpen: false }),
}))
