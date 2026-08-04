import growthRecordQuestions from '@/app/_mockdata/project-detail/project-growthrecordQuestion.json'
import { JOB_TABS, REQUIRED_JOB_TABS, RECORD_CATEGORY_TO_API } from '@/app/_utils/projectConstants'
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

// 기타(GENERAL)는 선택사항 — 성장기록 답변·이미지·피드백 질문이 전부(필수 직군과 동일한 기준으로)
// 채워져 있을 때만 발행에 포함하고, 하나라도 비어있으면 기타 관련 내용은 이번 발행에서 통째로 제외한다
// (일부만 채운 채로 보내면 백엔드의 "content should not be empty" 같은 필드 검증에 걸리기 때문)
function isTabComplete(
  tab: TabLabel,
  imagesByTab: BuildGrowthRecordPublishPayloadParams['imagesByTab'],
  answers: BuildGrowthRecordPublishPayloadParams['answers'],
  questionsByTab: BuildGrowthRecordPublishPayloadParams['questionsByTab']
): boolean {
  const hasAllAnswers = growthRecordQuestions.questions[TAB_TO_MOCK_CATEGORY[tab]].every(
    (q) => (answers[q.questionId] ?? '').trim().length > 0
  )
  const hasImage = (imagesByTab[tab] ?? []).length > 0
  const hasAllFeedbackQuestionText = questionsByTab[tab].every(
    (q) => q.isFreeComment || q.text.trim().length > 0
  )
  return hasAllAnswers && hasImage && hasAllFeedbackQuestionText
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
  const includedTabs: TabLabel[] = [
    ...REQUIRED_JOB_TABS,
    ...JOB_TABS.filter(
      (tab) =>
        !REQUIRED_JOB_TABS.includes(tab) && isTabComplete(tab, imagesByTab, answers, questionsByTab)
    ),
  ]

  const growthRecords: CreateVersionDto['growthRecords'] = includedTabs.map((tab) => ({
    category: RECORD_CATEGORY_TO_API[tab] as CreateVersionDto['growthRecords'][number]['category'],
    contents: growthRecordQuestions.questions[TAB_TO_MOCK_CATEGORY[tab]].map((q) => ({
      title: q.questionTitle,
      content: answers[q.questionId] ?? '',
      isDefault: true,
    })),
    imageKeys: imagesByTab[tab] ?? [],
  }))

  const feedbackQuestions: CreateVersionDto['feedbackQuestions'] = includedTabs.flatMap((tab) =>
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
