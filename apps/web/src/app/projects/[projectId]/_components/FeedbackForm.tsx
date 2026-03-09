'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import versionList from '@/app/_mockdata/project-detail/project-version.json'

const latestVersionId = versionList[0].id.toString()

export function CreateFeedbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const version = searchParams.get('version')

  const isLatestVersion = version === latestVersionId

  useEffect(() => {
    if (!isLatestVersion) {
      router.replace(`/projects/${params.projectId}/feedback`)
    }
  }, [isLatestVersion, router, params.projectId])

  if (!isLatestVersion) return null

  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <p className="text-body1_m_16 text-CoolNeutral-40">
        피드백 작성 페이지입니다. 곧 찾아뵐게요!
      </p>
    </div>
  )
}
