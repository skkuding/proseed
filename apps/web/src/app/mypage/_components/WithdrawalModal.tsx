'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authClient, authBaseURL } from '@/lib/auth-client'

const REASONS = [
  '기대했던 서비스와 달라요',
  '콘텐츠/정보가 부족해요',
  '오류가 자주 발생해요',
  '사용 방법/화면 구성이 어려워요',
  '다른 서비스가 더 만족스러워요',
  '가입 목적을 달성하여 당분간 사용할 일이 없어요',
]
const OTHER_REASON = '기타 (다른 의견을 남기고 싶어요)'

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

  const isOtherSelected = selected.includes(OTHER_REASON)
  const canWithdraw = selected.length > 0 && (!isOtherSelected || customReason.trim().length > 0)

  const toggleReason = (reason: string) => {
    if (reason === OTHER_REASON && isOtherSelected) {
      setCustomReason('')
    }
    setSelected((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    )
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`${authBaseURL}/api/auth/delete-user`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (res.status === 400 || res.status === 403) {
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
        className="relative w-[600px] h-[565px] rounded-[16px] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="iconMuted"
          size="bare"
          onClick={onClose}
          className="absolute right-6 top-6 text-black"
        >
          <X className="size-8" />
        </Button>

        {step === 'reason' && (
          <div className="flex flex-col gap-6 px-7 py-10">
            <div className="flex flex-col gap-1">
              <h2 className="text-title1_sb_28 text-black">어떤 이유로 탈퇴하시나요?</h2>
              <p className="text-body4_r_14 text-neutral-30">
                탈퇴 사유를 알려주시면 더 나은 서비스를 만드는 데 도움이 됩니다. (복수 선택 가능)
              </p>
            </div>

            <div className="flex flex-col gap-1">
              {REASONS.map((reason) => {
                const isChecked = selected.includes(reason)
                return (
                  <label key={reason} className="flex cursor-pointer items-center gap-2 py-1">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleReason(reason)}
                        className={isChecked ? 'sr-only' : 'h-5 w-5 accent-neutral-50'}
                      />
                      {isChecked && (
                        <Image
                          src="/checkbox_fill.svg"
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 shrink-0"
                        />
                      )}
                    </div>
                    <span className="text-body1_m_16 text-neutral-20">{reason}</span>
                  </label>
                )
              })}
              <div className="flex flex-col gap-2 py-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isOtherSelected}
                      onChange={() => toggleReason(OTHER_REASON)}
                      className={isOtherSelected ? 'sr-only' : 'h-5 w-5 accent-neutral-50'}
                    />
                    {isOtherSelected && (
                      <Image
                        src="/checkbox_fill.svg"
                        alt=""
                        width={36}
                        height={36}
                        className="shrink-0"
                      />
                    )}
                  </div>
                  <span className="text-body1_m_16 text-neutral-20">{OTHER_REASON}</span>
                </label>
                <div className="pl-7">
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value.slice(0, 200))}
                    placeholder="직접 입력해주세요"
                    disabled={!isOtherSelected}
                    className="h-[50px] w-full rounded-[8px] border border-neutral-95 px-4 py-3 text-body1_m_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none focus:border-neutral-50 disabled:bg-neutral-98 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleDelete}
              disabled={isDeleting || !canWithdraw}
              className="w-full text-sub3_sb_16"
            >
              {isDeleting ? '처리 중...' : 'PROSEED 탈퇴하기'}
            </Button>
          </div>
        )}

        {step === 'reauth' && (
          <div className="flex flex-col items-center justify-center gap-8 text-center h-full px-7 py-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-title1_sb_28 text-black">다시 로그인이 필요해요</h2>
              <p className="text-body1_m_16 text-neutral-40">
                보안을 위해 탈퇴 전 본인 확인이 필요합니다.
                <br />
                소셜 로그인으로 다시 인증 후 탈퇴를 진행해주세요.
              </p>
            </div>
            <Button size="md" onClick={handleReauth} className="w-full text-sub3_sb_16">
              다시 로그인하기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
