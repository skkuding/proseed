import { Suspense } from 'react'
import MyPageContent from './_components/MyPageContent'

export default function MyPage() {
  return (
    <Suspense>
      <MyPageContent />
    </Suspense>
  )
}
