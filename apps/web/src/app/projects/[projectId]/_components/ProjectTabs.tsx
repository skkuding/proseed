'use client'

import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePathname } from 'next/navigation'

export default function ProjectTabs() {
  const pathname = usePathname()
  const projectId = pathname.split('/')[2]

  const isFeedback = pathname.endsWith('/feedback')

  return (
    <Tabs value={isFeedback ? 'feedback' : 'record'} className="mb-12 bg-white">
      <TabsList className="w-80 min-h-[53px] justify-start">
        <TabsTrigger asChild value="record" className="w-40 pt-3 pb-4 hover:cursor-pointer">
          <Link href={`/projects/${projectId}`} scroll={false}>
            프로젝트 성장기록
          </Link>
        </TabsTrigger>

        <TabsTrigger asChild value="feedback" className="w-40 pt-3 pb-4 hover:cursor-pointer">
          <Link href={`/projects/${projectId}/feedback`} scroll={false}>
            프로젝트 피드백
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
