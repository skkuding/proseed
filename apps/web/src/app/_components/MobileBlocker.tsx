import Image from 'next/image'

export function MobileBlocker() {
  return (
    <div className="fixed inset-0 z-50 hidden flex-col items-center justify-center gap-5 bg-white p-10 max-[640px]:flex">
      <Image src="/simbol.svg" alt="PROSEED" width={60} height={60} />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-title5_sb_20 text-black">모바일 환경은 아직 준비 중이에요</p>
        <p className="text-body2_m_14 text-CoolNeutral-30">
          아직 모바일 화면을 지원하지 않습니다.
          <br />
          PC에서 접속하시면 모든 기능을 이용하실 수 있어요.
        </p>
      </div>
    </div>
  )
}
