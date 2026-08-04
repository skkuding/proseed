import 'reflect-metadata'
import { RecordCategory } from '@prisma/client'
import {
  FeedbackQuestionsPerCategoryConstraint,
  GrowthRecordCategoryCoverageConstraint,
  type CreateFeedbackQuestionDto,
  type CreateGrowthRecordDto,
} from './create-version.dto'

const REQUIRED_CATEGORIES = [
  RecordCategory.PLAN,
  RecordCategory.DESIGN,
  RecordCategory.DEVELOPMENT,
]

const growthRecordsFor = (
  categories: RecordCategory[],
): CreateGrowthRecordDto[] =>
  categories.map((category) => ({
    category,
    contents: [{ title: 'title', content: 'content' }],
  }))

const feedbackQuestionsFor = (
  categories: RecordCategory[],
): CreateFeedbackQuestionDto[] =>
  categories.map((category) => ({ category, content: 'question' }))

describe('GrowthRecordCategoryCoverageConstraint', () => {
  const constraint = new GrowthRecordCategoryCoverageConstraint()

  it('PLAN/DESIGN/DEVELOPMENT + GENERAL 4개를 전부 포함하면 통과한다', () => {
    const records = growthRecordsFor([
      ...REQUIRED_CATEGORIES,
      RecordCategory.GENERAL,
    ])
    expect(constraint.validate(records)).toBe(true)
  })

  it('GENERAL 없이 3개(PLAN/DESIGN/DEVELOPMENT)만 있어도 통과한다', () => {
    const records = growthRecordsFor(REQUIRED_CATEGORIES)
    expect(constraint.validate(records)).toBe(true)
  })

  it('필수 직군(PLAN) 하나라도 빠지면 실패한다', () => {
    const records = growthRecordsFor([
      RecordCategory.DESIGN,
      RecordCategory.DEVELOPMENT,
    ])
    expect(constraint.validate(records)).toBe(false)
  })

  it('GENERAL이 중복되면 실패한다', () => {
    const records = growthRecordsFor([
      ...REQUIRED_CATEGORIES,
      RecordCategory.GENERAL,
      RecordCategory.GENERAL,
    ])
    expect(constraint.validate(records)).toBe(false)
  })
})

describe('FeedbackQuestionsPerCategoryConstraint', () => {
  const constraint = new FeedbackQuestionsPerCategoryConstraint()

  it('GENERAL 포함 4개 직군 모두 1개씩 있으면 통과한다', () => {
    const questions = feedbackQuestionsFor([
      ...REQUIRED_CATEGORIES,
      RecordCategory.GENERAL,
    ])
    expect(constraint.validate(questions)).toBe(true)
  })

  it('GENERAL 질문이 하나도 없어도 통과한다', () => {
    const questions = feedbackQuestionsFor(REQUIRED_CATEGORIES)
    expect(constraint.validate(questions)).toBe(true)
  })

  it('필수 직군(DESIGN) 질문이 하나도 없으면 실패한다', () => {
    const questions = feedbackQuestionsFor([
      RecordCategory.PLAN,
      RecordCategory.DEVELOPMENT,
    ])
    expect(constraint.validate(questions)).toBe(false)
  })

  it('GENERAL 질문이 4개를 초과하면 실패한다', () => {
    const questions = feedbackQuestionsFor([
      ...REQUIRED_CATEGORIES,
      RecordCategory.GENERAL,
      RecordCategory.GENERAL,
      RecordCategory.GENERAL,
      RecordCategory.GENERAL,
      RecordCategory.GENERAL,
    ])
    expect(constraint.validate(questions)).toBe(false)
  })
})
