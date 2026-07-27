import { AccordionItem } from '@/components/ui/accordion'
import type { FeedbackListItemDto } from '@/lib/api'
import { FeedbackSubmissionPreview } from './FeedbackSubmissionPreview'
import { FeedbackSubmissionDetail } from './FeedbackSubmissionDetail'

export type SubmissionQuestion = {
  questionId: number
  questionTitle: string
  questionContent: string
  content: string
  imageUrls: string[]
}

export type SubmissionCard = {
  submissionId: number
  category: FeedbackListItemDto['category']
  author: FeedbackListItemDto['author']
  oneLineReview: string
  createdAt: string
  isAdopted: boolean
  /** 이 (제출, 직군)이 열람(unlock)됐는지. false면 questions[].content/imageUrls는 서버에서 비워져 있음 */
  isUnlocked: boolean
  questions: SubmissionQuestion[]
}

//같은 제출이 여러 직군에 답했을 수 있어 (submissionId, category) 단위로 카드를 만든다
//호출부가 items를 이미 단일 category로 필터해서 넘기므로 submissionId만으로 그룹핑해도 안전
export function buildSubmissionCards(items: FeedbackListItemDto[]): SubmissionCard[] {
  const bySubmission = new Map<number, SubmissionCard>()
  for (const item of items) {
    const card = bySubmission.get(item.submissionId) ?? {
      submissionId: item.submissionId,
      category: item.category,
      author: item.author,
      oneLineReview: item.oneLineReview,
      createdAt: item.createdAt,
      isAdopted: item.isAdopted,
      isUnlocked: item.isUnlocked,
      questions: [],
    }
    card.questions.push({
      questionId: item.questionId,
      questionTitle: item.questionTitle,
      questionContent: item.questionContent,
      content: item.content,
      imageUrls: item.imageUrls,
    })
    bySubmission.set(item.submissionId, card)
  }
  return [...bySubmission.values()]
}

interface FeedbackSubmissionCardProps {
  card: SubmissionCard
  isOpen: boolean
  isHighlighted: boolean
  selectedQuestionId: number | undefined
  onSelectQuestion: (questionId: number) => void
  onImageClick: (images: string[], index: number) => void
  /** 프로젝트 팀원만 unlock 가능 */
  canUnlock: boolean
  ticketCount: number | null
  isUnlocking: boolean
  unlockErrorMessage: string | null
  onUnlock: () => void
}

export function FeedbackSubmissionCard({
  card,
  isOpen,
  isHighlighted,
  selectedQuestionId,
  onSelectQuestion,
  onImageClick,
  canUnlock,
  ticketCount,
  isUnlocking,
  unlockErrorMessage,
  onUnlock,
}: FeedbackSubmissionCardProps) {
  return (
    <AccordionItem
      id={`feedback-${card.submissionId}`}
      value={String(card.submissionId)}
      className={`scroll-mt-24 overflow-hidden transition-colors duration-1000 ${isHighlighted ? 'rounded-xl bg-CoolNeutral-95' : ''}`}
    >
      <FeedbackSubmissionPreview card={card} isOpen={isOpen} />
      <FeedbackSubmissionDetail
        card={card}
        selectedQuestionId={selectedQuestionId}
        onSelectQuestion={onSelectQuestion}
        onImageClick={onImageClick}
        canUnlock={canUnlock}
        ticketCount={ticketCount}
        isUnlocking={isUnlocking}
        unlockErrorMessage={unlockErrorMessage}
        onUnlock={onUnlock}
      />
    </AccordionItem>
  )
}
