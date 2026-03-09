export default function HeroSection() {
  return (
    <section className="w-full overflow-hidden rounded-[24px] bg-white">
      <div className="flex min-h-[320px] flex-col items-center justify-center px-8 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold leading-tight text-black">
          흩어져 있던 프로젝트의 기록,
          <br />
          아는 것 이상의 성장으로
        </h1>

        <p className="mb-8 text-sm leading-6 text-gray-500">
          낯선 피드백이 만드는 확실한 변화, PROSEED에서
          <br />
          당신의 프로젝트 성장사를 기록하고 돌아보며 포트폴리오를 완성하세요.
        </p>

        <button className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white">
          프로젝트 시작하기
        </button>
      </div>
    </section>
  )
}
