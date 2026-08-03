import { create } from 'zustand'
import type { RecordCategory } from '@/lib/api'

//실제 발행 payload(taggedFeedbacks)로 보낼 (versionId, userId) + 모달/미리보기 표시용 정보.
//성장기록(버전)이 아직 없어 남긴 자유 피드백은 versionId가 null.
export type TaggedFeedbackEntry = {
  versionId: number | null
  userId: number
  submissionId: number
  author: { name: string; profileImageUrl: string }
  oneLineReview: string
}

export type TaggedFeedbacksByCategory = Record<RecordCategory, TaggedFeedbackEntry[]>

const EMPTY_TAGGED_FEEDBACKS: TaggedFeedbacksByCategory = {
  PLAN: [],
  DESIGN: [],
  DEVELOPMENT: [],
  GENERAL: [],
}

interface FeedbackTagState {
  taggedFeedbacks: TaggedFeedbacksByCategory
  setTaggedFeedbacks: (feedbacks: TaggedFeedbacksByCategory) => void
  removeTaggedFeedback: (category: RecordCategory, versionId: number | null, userId: number) => void
  resetTaggedFeedbacks: () => void
}

export const useFeedbackTagStore = create<FeedbackTagState>((set) => ({
  taggedFeedbacks: EMPTY_TAGGED_FEEDBACKS,
  setTaggedFeedbacks: (feedbacks) => set({ taggedFeedbacks: feedbacks }),
  removeTaggedFeedback: (category, versionId, userId) =>
    set((state) => ({
      taggedFeedbacks: {
        ...state.taggedFeedbacks,
        [category]: state.taggedFeedbacks[category].filter(
          (entry) => !(entry.versionId === versionId && entry.userId === userId)
        ),
      },
    })),
  resetTaggedFeedbacks: () => set({ taggedFeedbacks: EMPTY_TAGGED_FEEDBACKS }),
}))
