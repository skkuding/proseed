import growthRecordQuestions from '@/app/_mockdata/project-detail/project-growthrecordQuestion.json'
import { JOB_TABS, RECORD_CATEGORY_TO_API } from '@/app/_utils/projectConstants'
import type { CreateVersionDto, RecordCategory } from '@/lib/api'
import type { TaggedFeedbackEntry } from '@/store/feedbackTagStore'

export const FREE_COMMENT_CONTENT = '자유롭게 하고 싶은 말을 남겨주세요'

export type TabLabel = (typeof JOB_TABS)[number]

export const TAB_TO_MOCK_CATEGORY: Record<TabLabel, keyof typeof growthRecordQuestions.questions> =
  {
    기획: 'plan',
    디자인: 'design',
    개발: 'dev',
    기타: 'general',
  }

export type FeedbackQuestionDraft = {
  id: string
  text: string
  isRequired: boolean
  isFreeComment: boolean
}

interface BuildGrowthRecordPublishPayloadParams {
  version: { major: string; minor: string; patch: string }
  imagesByTab: Record<string, string[]>
  answers: Record<number, string>
  taggedFeedbacks: Record<RecordCategory, TaggedFeedbackEntry[]>
  questionsByTab: Record<TabLabel, FeedbackQuestionDraft[]>
  goal: string
  result: string
}

// 성장기록/피드백 질문/태그된 피드백을 발행 API payload 형태로 조립한다 —
// FeedbackQuestionsForm의 "프로젝트 업데이트" 버튼(리드가 목표/결과물을 입력한 직후)에서만 호출됨
export function buildGrowthRecordPublishPayload({
  version,
  imagesByTab,
  answers,
  taggedFeedbacks,
  questionsByTab,
  goal,
  result,
}: BuildGrowthRecordPublishPayloadParams): CreateVersionDto {
  const growthRecords: CreateVersionDto['growthRecords'] = JOB_TABS.map((tab) => ({
    category: RECORD_CATEGORY_TO_API[tab] as CreateVersionDto['growthRecords'][number]['category'],
    contents: growthRecordQuestions.questions[TAB_TO_MOCK_CATEGORY[tab]].map((q) => ({
      title: q.questionTitle,
      content: answers[q.questionId] ?? '',
      isDefault: true,
    })),
    imageKeys: imagesByTab[tab] ?? [],
  }))

  const feedbackQuestions: CreateVersionDto['feedbackQuestions'] = JOB_TABS.flatMap((tab) =>
    questionsByTab[tab].map((q) => ({
      category: RECORD_CATEGORY_TO_API[
        tab
      ] as CreateVersionDto['feedbackQuestions'][number]['category'],
      content: q.isFreeComment ? FREE_COMMENT_CONTENT : q.text,
      isRequired: q.isRequired,
    }))
  )

  const taggedFeedbacksPayload: CreateVersionDto['taggedFeedbacks'] = Object.entries(
    taggedFeedbacks
  )
    .filter(([, entries]) => entries.length > 0)
    .map(([category, entries]) => ({
      category: category as CreateVersionDto['feedbackQuestions'][number]['category'],
      submissions: entries.map((entry) => ({
        versionId: entry.versionId,
        userId: entry.userId,
      })),
    }))

  return {
    version: `${version.major}.${version.minor}.${version.patch}`,
    updateGoal: goal,
    updateResults: [result],
    growthRecords,
    feedbackQuestions,
    taggedFeedbacks: taggedFeedbacksPayload,
  }
}
