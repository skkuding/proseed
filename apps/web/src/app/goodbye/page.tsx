import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function GoodbyePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-head3_sb_36 text-black">탈퇴가 완료되었습니다</h1>
        <p className="text-body1_m_16 text-neutral-40">
          그동안 PROSEED를 이용해주셔서 감사합니다.
          <br />더 나은 서비스로 발전하겠습니다.
        </p>
      </div>
      <Button
        asChild
        className="h-13 w-[166px] rounded-[8px] bg-CoolNeutral-20 px-5 py-[15px] text-sub3_sb_16 text-white hover:cursor-pointer"
      >
        <Link href="/">홈 화면으로 돌아가기</Link>
      </Button>
    </div>
  )
}
