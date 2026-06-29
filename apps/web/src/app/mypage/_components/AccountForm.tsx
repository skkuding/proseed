'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WithdrawalModal } from './WithdrawalModal'

const PROVIDER_LABEL: Record<string, string> = {
  google: '구글',
  kakao: '카카오',
  naver: '네이버',
}

interface AccountFormProps {
  email: string
  provider: string
}

export function AccountForm({ email, provider }: AccountFormProps) {
  const [showWithdrawal, setShowWithdrawal] = useState(false)

  const providerLabel = PROVIDER_LABEL[provider] ?? '소셜'

  return (
    <>
      <div className="flex-1 min-w-0 bg-white px-9 py-10 flex flex-col gap-7">
        {/* div1 */}
        <h2 className="text-head3_sb_36 text-black">계정 관리</h2>

        {/* div2 */}
        <div className="flex flex-col gap-4">
          {/* 현재 로그인 */}
          <div className="flex items-center gap-10">
            <label className="w-20 shrink-0 text-sub2_m_18 text-black">현재 로그인</label>
            <input
              type="text"
              value={`${providerLabel} 계정으로 로그인`}
              disabled
              className="flex-1 min-w-0 rounded-[8px] border border-neutral-90 bg-neutral-99 px-4 py-3 text-body1_m_16 text-neutral-80 outline-none"
            />
          </div>

          {/* 이메일 정보 */}
          <div className="flex items-center gap-10">
            <label className="w-20 shrink-0 text-sub2_m_18 text-black">이메일 정보</label>
            <input
              type="text"
              value={email}
              disabled
              className="flex-1 min-w-0 rounded-[8px] border border-neutral-90 bg-neutral-99 px-4 py-3 text-body1_m_16 text-neutral-80 outline-none"
            />
          </div>

          {/* 탈퇴하기 */}
          <div className="flex items-center gap-10">
            <label className="w-20 shrink-0 text-sub2_m_18 text-black">탈퇴하기</label>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawal(true)}
              className="rounded-lg w-[123px] h-12 border-CoolNeutral-50 border-[1.4px] px-5 py-[13px] text-CoolNeutral-20 text-sub3_sb_16 hover:cursor-pointer"
            >
              회원 탈퇴하기
            </Button>
          </div>
        </div>
      </div>

      <WithdrawalModal
        isOpen={showWithdrawal}
        onClose={() => setShowWithdrawal(false)}
        provider={provider}
      />
    </>
  )
}
