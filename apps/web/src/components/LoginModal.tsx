'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

const PROVIDERS = [
  {
    id: 'google' as const,
    label: 'Google로 시작하기',
    icon: '/google.svg',
    iconSize: 42,
    rounded: false,
  },
  {
    id: 'kakao' as const,
    label: 'Kakao로 시작하기',
    icon: '/kakao.svg',
    iconSize: 30,
    rounded: true,
  },
  {
    id: 'naver' as const,
    label: 'Naver로 시작하기',
    icon: '/naver.svg',
    iconSize: 30,
    rounded: true,
  },
]

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null

  const handleLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    await authClient.signIn.social({
      provider,
      callbackURL: typeof window !== 'undefined' ? window.location.origin : '/',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[20px]"
      onClick={onClose}
    >
      <div
        className="relative w-[476px] rounded-[12px] bg-white px-10 py-15"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-neutral-40 transition-colors hover:cursor-pointer hover:text-CoolNeutral-20"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-title1_sb_28">PROSEED와 함께 성장하세요</h2>
            <p className="text-body1_r_16 text-neutral-30">
              사이드 프로젝트, 더이상 방치 말고 커리어 자산으로 바꿔보세요
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              {PROVIDERS.map(({ id, label, icon, iconSize, rounded }) => (
                <button
                  key={id}
                  onClick={() => handleLogin(id)}
                  className="flex w-full items-center justify-center gap-4 rounded-[4px] border border-neutral-90 bg-white px-25 py-[6px] text-[16px] leading-[19.2px] font-semibold tracking-[-0.32px] text-color-neutral-30 transition-colors hover:cursor-pointer hover:bg-neutral-99"
                >
                  <span
                    className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center ${
                      rounded ? 'overflow-hidden rounded-[4px]' : ''
                    }`}
                  >
                    <Image
                      src={icon}
                      alt={label}
                      width={iconSize}
                      height={iconSize}
                      className={rounded ? 'rounded-[4px]' : ''}
                    />
                  </span>

                  <span>{label}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-label4_m_12 text-neutral-80">
              본인은 만 14세 이상이며,{' '}
              <span className="underline underline-offset-2">서비스 이용약관</span> 및{' '}
              <span className="underline underline-offset-2">개인정보 처리방침</span>에 동의하고,
              <br />
              서비스 제공을 위한 이름과 이메일 수집에 동의합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
