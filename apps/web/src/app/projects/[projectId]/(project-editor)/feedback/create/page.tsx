'use client'

import { Suspense, useEffect } from 'react'
import { CreateFeedbackContent } from '../../../_components/FeedbackForm'

export default function CreateFeedback() {
  useEffect(() => {
    document.title = '피드백 작성 | PROSEED'
  }, [])

  return (
    <Suspense>
      <CreateFeedbackContent />
    </Suspense>
  )
}
