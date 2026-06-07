'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

const BETTER_AUTH_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')

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
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 되돌릴 수 없습니다.'))
      return
    setIsDeleting(true)
    try {
      const res = await fetch(`${BETTER_AUTH_BASE}/api/auth/delete-user`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error('탈퇴 실패')
      await authClient.signOut()
      router.push('/')
    } catch (e) {
      console.error(e)
      window.alert('탈퇴 처리 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const providerLabel = PROVIDER_LABEL[provider] ?? '소셜'

  return (
    <div className="flex-1 rounded-2xl bg-white p-8">
      <h2 className="mb-8 text-title3_sb_24 text-neutral-10">계정 관리</h2>

      <div className="flex flex-col gap-4">
        {/* 현재 로그인 */}
        <div className="flex items-center gap-10">
          <label className="w-20 shrink-0 text-sub2_m_18 text-neutral-40">현재 로그인</label>
          <input
            type="text"
            value={`${providerLabel} 계정으로 로그인`}
            disabled
            className="w-120 rounded-lg border border-neutral-90 bg-neutral-99 px-4 py-3 text-body3_r_16 text-neutral-70 outline-none"
          />
        </div>

        {/* 이메일 정보 */}
        <div className="flex items-center gap-10">
          <label className="w-20 shrink-0 text-sub2_m_18 text-neutral-40">이메일 정보</label>
          <input
            type="text"
            value={email}
            disabled
            className="w-120 rounded-lg border border-neutral-90 bg-neutral-99 px-4 py-3 text-body3_r_16 text-neutral-70 outline-none"
          />
        </div>

        {/* 탈퇴하기 */}
        <div className="flex items-center gap-10">
          <label className="w-20 shrink-0 text-sub2_m_18 text-neutral-40">탈퇴하기</label>
          <Button
            variant="outline"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="rounded-lg w-[123px] h-12 border-neutral-90 px-5 text-neutral-40 text-sub3_sb_16 hover:cursor-pointer"
          >
            {isDeleting ? '처리 중...' : '회원 탈퇴하기'}
          </Button>
        </div>
      </div>
    </div>
  )
}
