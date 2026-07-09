import { create } from 'zustand'
import { type JobTab } from '@/app/_utils/projectConstants'

interface AuthStore {
  isLoginModalOpen: boolean
  isOnboardingModalOpen: boolean
  onboardingNickname: string
  jobType: JobTab | null
  openLoginModal: () => void
  closeLoginModal: () => void
  openOnboardingModal: (nickname: string) => void
  closeOnboardingModal: () => void
  setJobType: (job: JobTab) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoginModalOpen: false,
  isOnboardingModalOpen: false,
  onboardingNickname: '',
  jobType: null,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  openOnboardingModal: (nickname) =>
    set({ isOnboardingModalOpen: true, onboardingNickname: nickname }),
  closeOnboardingModal: () => set({ isOnboardingModalOpen: false }),
  setJobType: (job) => set({ jobType: job }),
}))
