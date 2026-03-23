import { create } from 'zustand'

interface FeedbackTagState {
  taggedFeedbacks: Record<string, number[]>
  setTaggedFeedbacks: (feedbacks: Record<string, number[]>) => void
  removeTaggedFeedback: (category: string, feedbackId: number) => void
}

export const useFeedbackTagStore = create<FeedbackTagState>((set) => ({
  taggedFeedbacks: {
    plan: [],
    design: [],
    dev: [],
    general: [],
  },
  setTaggedFeedbacks: (feedbacks) => set({ taggedFeedbacks: feedbacks }),
  removeTaggedFeedback: (category, feedbackId) =>
    set((state) => ({
      taggedFeedbacks: {
        ...state.taggedFeedbacks,
        [category]: state.taggedFeedbacks[category].filter((id) => id !== feedbackId),
      },
    })),
}))
