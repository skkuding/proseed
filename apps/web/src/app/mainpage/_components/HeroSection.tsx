import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="w-full">
      <div className="relative h-[475px] w-full overflow-hidden rounded-[28px]">
        <Image src="/main.svg" alt="메인 배너 배경" fill priority className="object-cover" />

        <div className="absolute inset-0 flex items-start justify-center pt-[108px] text-center">
          <div className="flex w-[566px] flex-col items-center">
            <h1 className="text-[48px] font-bold leading-[63.36px] tracking-[-1.92px] text-black">
              흩어져 있던 프로젝트의 기록,
              <br />
              아는 것 이상의 성장으로
            </h1>

            <p className="mt-5 w-[566px] text-base font-normal leading-[28px] tracking-[-0.8px] text-black/80">
              낯선 피드백이 만드는 확실한 변화, PROSEED에서
              <br />
              당신의 프로젝트 성장사를 기록하고 독보적인 포트폴리오를 완성하세요.
            </p>

            <Link
              href="/myproject"
              className="mt-12 inline-flex h-[46px] items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold leading-[22.4px] tracking-[-0.64px] text-white"
            >
              프로젝트 시작하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
