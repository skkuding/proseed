import { create } from 'zustand'

interface GrowthRecordState {
  version: { major: string; minor: string; patch: string }
  imagesByTab: Record<string, string[]> // tab -> uploaded image keys/urls
  answers: Record<number, string> // questionId -> answer
  taggedFeedbacks: Record<string, number[]>
  updateGoal: string
  updateResult: string
  setVersion: (version: { major: string; minor: string; patch: string }) => void
  setImagesByTab: (imagesByTab: Record<string, string[]>) => void
  setAnswers: (answers: Record<number, string>) => void
  setTaggedFeedbacks: (taggedFeedbacks: Record<string, number[]>) => void
  setUpdateGoal: (goal: string) => void
  setUpdateResult: (result: string) => void
}

export const useGrowthRecordStore = create<GrowthRecordState>((set) => ({
  version: { major: '', minor: '', patch: '' },
  imagesByTab: {},
  answers: {},
  taggedFeedbacks: {},
  updateGoal: '',
  updateResult: '',
  setVersion: (version) => set({ version }),
  setImagesByTab: (imagesByTab) => set({ imagesByTab }),
  setAnswers: (answers) => set({ answers }),
  setTaggedFeedbacks: (taggedFeedbacks) => set({ taggedFeedbacks }),
  setUpdateGoal: (updateGoal) => set({ updateGoal }),
  setUpdateResult: (updateResult) => set({ updateResult }),
}))
