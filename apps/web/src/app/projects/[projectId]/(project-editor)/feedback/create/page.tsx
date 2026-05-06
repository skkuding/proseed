'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import versionList from '@/app/_mockdata/project-detail/project-version.json'
import { CreateFeedbackContent } from '../../../_components/FeedbackForm'

export default function CreateFeedback() {
  return (
    <Suspense>
      <CreateFeedbackContent />
    </Suspense>
  )
}
