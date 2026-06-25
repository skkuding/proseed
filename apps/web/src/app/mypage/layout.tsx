export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen pt-10">
      <div className="w-full flex flex-col gap-10">
        <div>
          <h1 className="text-head0_sb_52 text-black">마이페이지</h1>
          <p className="mt-2 text-title6_m_20 text-CoolNeutral-40">
            프로필 정보 수정부터 계정 설정, 궁금한 점 해결까지 간편하게 확인하세요
          </p>
        </div>
        {children}
      </div>
    </main>
  )
}
