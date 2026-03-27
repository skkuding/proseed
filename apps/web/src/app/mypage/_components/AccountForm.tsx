import { Button } from '@/components/ui/button'

export function AccountForm() {
  return (
    <div className="flex-1 rounded-2xl bg-white p-8">
      <h2 className="mb-8 text-title3_sb_24 text-neutral-10">계정 관리</h2>

      <div className="flex flex-col gap-4">
        {/* 현재 로그인 */}
        <div className="flex items-center gap-10">
          <label className="w-20 shrink-0 text-sub2_m_18 text-neutral-40">현재 로그인</label>
          <input
            type="text"
            value="카카오 계정으로 로그인"
            disabled
            className="w-120 rounded-lg border border-neutral-90 bg-neutral-99 px-4 py-3 text-body3_r_16 text-neutral-70 outline-none"
          />
        </div>

        {/* 이메일 정보 */}
        <div className="flex items-center gap-10">
          <label className="w-20 shrink-0 text-sub2_m_18 text-neutral-40">이메일 정보</label>
          <input
            type="text"
            value="proseed@gmail.com"
            disabled
            className="w-120 rounded-lg border border-neutral-90 bg-neutral-99 px-4 py-3 text-body3_r_16 text-neutral-70 outline-none"
          />
        </div>

        {/* 탈퇴하기 */}
        <div className="flex items-center gap-10">
          <label className="w-20 shrink-0 text-sub2_m_18 text-neutral-40">탈퇴하기</label>
          <Button
            variant="outline"
            className="rounded-lg w-[123px] h-12 border-neutral-90 px-5 text-neutral-40 text-sub3_sb_16"
          >
            회원 탈퇴하기
          </Button>
        </div>
      </div>
    </div>
  )
}
