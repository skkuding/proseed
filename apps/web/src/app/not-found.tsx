import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col gap-4">
        <p className="text-title6_m_20 text-CoolNeutral-50">404</p>
        <h1 className="text-head3_sb_36 text-black">페이지를 찾을 수 없어요</h1>
        <p className="text-body1_m_16 text-neutral-40">
          요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있어요.
          <br />
          메인 화면에서 다시 찾아보세요.
        </p>
      </div>
      <Button asChild size="lg" className="w-[166px] text-sub3_sb_16">
        <Link href="/">메인 화면으로 가기</Link>
      </Button>
    </div>
  )
}
