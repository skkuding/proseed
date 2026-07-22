import { create } from 'zustand'
import type { TaggedFeedbackEntry } from './feedbackTagStore'
import type { RecordCategory } from '@/lib/api'

interface GrowthRecordState {
  version: { major: string; minor: string; patch: string }
  imagesByTab: Record<string, string[]> // tab -> uploaded image keys/urls
  answers: Record<number, string> // questionId -> answer
  taggedFeedbacks: Record<RecordCategory, TaggedFeedbackEntry[]>
  updateGoal: string
  updateResult: string
  setVersion: (version: { major: string; minor: string; patch: string }) => void
  setImagesByTab: (imagesByTab: Record<string, string[]>) => void
  setAnswers: (answers: Record<number, string>) => void
  setTaggedFeedbacks: (taggedFeedbacks: Record<RecordCategory, TaggedFeedbackEntry[]>) => void
  setUpdateGoal: (goal: string) => void
  setUpdateResult: (result: string) => void
  // 발행 성공 후 다음 성장기록 작성이 이전 값으로 채워지지 않도록 초기화
  reset: () => void
}

const initialState = {
  version: { major: '', minor: '', patch: '' },
  imagesByTab: {},
  answers: {},
  taggedFeedbacks: { PLAN: [], DESIGN: [], DEVELOPMENT: [], GENERAL: [] },
  updateGoal: '',
  updateResult: '',
} satisfies Partial<GrowthRecordState>

export const useGrowthRecordStore = create<GrowthRecordState>((set) => ({
  ...initialState,
  setVersion: (version) => set({ version }),
  setImagesByTab: (imagesByTab) => set({ imagesByTab }),
  setAnswers: (answers) => set({ answers }),
  setTaggedFeedbacks: (taggedFeedbacks) => set({ taggedFeedbacks }),
  setUpdateGoal: (updateGoal) => set({ updateGoal }),
  setUpdateResult: (updateResult) => set({ updateResult }),
  reset: () => set(initialState),
}))
