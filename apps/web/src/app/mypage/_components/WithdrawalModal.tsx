'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

const BETTER_AUTH_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')

const REASONS = [
  '서비스에 만족하지 못해서',
  '원하는 기능이 없어서',
  '개인정보 보호를 위해',
  '더 이상 사용하지 않아서',
  '기타',
]

interface Props {
  isOpen: boolean
  onClose: () => void
  provider: string
}

type Step = 'reason' | 'reauth'

export function WithdrawalModal({ isOpen, onClose, provider }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('reason')
  const [selected, setSelected] = useState<string[]>([])
  const [customReason, setCustomReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const toggleReason = (reason: string) => {
    setSelected((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    )
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`${BETTER_AUTH_BASE}/api/auth/delete-user`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (res.status === 403) {
        setStep('reauth')
        return
      }

      if (!res.ok) throw new Error('탈퇴 실패')

      await authClient.signOut()
      router.push('/goodbye')
    } catch (e) {
      console.error(e)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReauth = async () => {
    await authClient.signIn.social({
      provider: provider as 'google' | 'kakao' | 'naver',
      callbackURL: typeof window !== 'undefined' ? window.location.href : '/mypage',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[20px]"
      onClick={onClose}
    >
      <div
        className="relative w-[480px] rounded-[12px] bg-white px-10 py-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-neutral-40 transition-colors hover:cursor-pointer hover:text-CoolNeutral-20"
        >
          <X className="size-5" />
        </button>

        {step === 'reason' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-title1_sb_28 text-black">정말 탈퇴하시겠어요?</h2>
              <p className="text-body1_m_16 text-neutral-40">
                탈퇴 사유를 알려주시면 더 나은 서비스를 만드는 데 도움이 됩니다.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {REASONS.map((reason) => (
                <label key={reason} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(reason)}
                    onChange={() => toggleReason(reason)}
                    className="h-5 w-5 accent-CoolNeutral-20"
                  />
                  <span className="text-body1_m_16 text-CoolNeutral-20">{reason}</span>
                </label>
              ))}
              {selected.includes('기타') && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value.slice(0, 200))}
                  placeholder="직접 입력해주세요"
                  rows={3}
                  className="mt-1 w-full resize-none rounded-[8px] border border-neutral-95 p-4 text-body1_m_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none focus:border-neutral-50"
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-12 flex-1 rounded-[8px] border-CoolNeutral-50 text-sub3_sb_16 text-CoolNeutral-20 hover:cursor-pointer"
              >
                취소
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-12 flex-1 rounded-[8px] bg-red-500 text-sub3_sb_16 text-white hover:cursor-pointer hover:bg-red-600 disabled:opacity-60"
              >
                {isDeleting ? '처리 중...' : '탈퇴하기'}
              </Button>
            </div>
          </div>
        )}

        {step === 'reauth' && (
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-title1_sb_28 text-black">다시 로그인이 필요해요</h2>
              <p className="text-body1_m_16 text-neutral-40">
                보안을 위해 탈퇴 전 본인 확인이 필요합니다.
                <br />
                소셜 로그인으로 다시 인증 후 탈퇴를 진행해주세요.
              </p>
            </div>
            <Button
              onClick={handleReauth}
              className="h-12 w-full rounded-[8px] bg-CoolNeutral-20 text-sub3_sb_16 text-white hover:cursor-pointer"
            >
              다시 로그인하기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
