'use client'

import { Suspense } from 'react'
import { CreateFeedbackContent } from '../../../_components/FeedbackForm'

export default function CreateFeedback() {
  return (
    <Suspense>
      <CreateFeedbackContent />
    </Suspense>
  )
}
