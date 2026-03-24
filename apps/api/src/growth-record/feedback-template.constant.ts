export const FeedbackCategory = {
  PLAN: 'PLAN',
  DESIGN: 'DESIGN',
  DEVELOPMENT: 'DEVELOPMENT',
  GENERAL: 'GENERAL',
} as const

export type FeedbackCategory =
  (typeof FeedbackCategory)[keyof typeof FeedbackCategory]

export interface FeedbackTemplate {
  category: FeedbackCategory
  questions: readonly string[]
}

export const FEEDBACK_TEMPLATES: readonly FeedbackTemplate[] = Object.freeze([
  {
    category: FeedbackCategory.PLAN,
    questions: Object.freeze([
      "처음 사용할 때 '어디를 눌러야 하지?'라고 고민했던 순간은 있었나요?",
      '비슷한 서비스와 비교했을 때, 차별점이 바로 보이지 않았던 이유는 무엇인가요?',
      '반드시 필요했을 것 같은데 빠져 있는 기능은 무엇인가요?',
      '사용 흐름 중에서 가장 귀찮거나 반복적이라고 느껴진 부분은 어디인가요?',
      '추가로 하고 싶은 말이 있다면 적어주세요.',
    ]),
  },
  {
    category: FeedbackCategory.DESIGN,
    questions: Object.freeze([
      '의미를 추측해야 했던 버튼/용어/UI 요소가 있다면 무엇인가요?',
      "처음 사용할 때 '어디를 눌러야 하지?'라고 고민했던 순간은 있었나요?",
      '추가로 하고 싶은 말이 있다면 적어주세요.',
    ]),
  },
  {
    category: FeedbackCategory.DEVELOPMENT,
    questions: Object.freeze([
      "이 프로젝트가 '아직 덜 만들어진 느낌'을 주는 부분은 어디인가요?",
      '에러가 날 것 같거나, 실제로 불안했던 순간이 있었나요?',
      '로딩이 오래 걸리거나, 에러가 난 페이지가 있었나요?',
      '추가로 하고 싶은 말이 있다면 적어주세요.',
    ]),
  },
  {
    category: FeedbackCategory.GENERAL,
    questions: Object.freeze([
      "이 프로젝트를 '이것 때문에 안 쓸 것 같다'고 느껴진다면, 그 요소는 무엇인가요?",
      '이 프로젝트의 확장/성장과 관련한 가능성 또는 어려움을 적어주세요.',
      '추가로 하고 싶은 말이 있다면 적어주세요.',
    ]),
  },
])
