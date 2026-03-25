'use client'

import { Suspense } from 'react'
import { FeedbackQuestionsForm } from '../../../_components/FeedbackQuestionsForm'

export default function FeedbackQuestionsPage() {
  return (
    <Suspense>
      <FeedbackQuestionsForm />
    </Suspense>
  )
}
