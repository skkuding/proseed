'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePathname, useRouter } from 'next/navigation'

export default function ProjectTabs() {
  const pathname = usePathname()
  const router = useRouter()
  const projectId = pathname.split('/')[2]

  const isFeedback = pathname.endsWith('/feedback')

  return (
    <Tabs value={isFeedback ? 'feedback' : 'record'} className="mb-12 bg-white">
      <TabsList className="w-80 min-h-[53px] justify-start">
        <TabsTrigger
          value="record"
          onClick={() => router.push(`/projects/${projectId}`)}
          className="w-40 pt-3 pb-4"
        >
          프로젝트 성장 기록
        </TabsTrigger>

        <TabsTrigger
          value="feedback"
          onClick={() => router.push(`/projects/${projectId}/feedback`)}
          className="w-40 pt-3 pb-4"
        >
          프로젝트 피드백
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
