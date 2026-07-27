import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import tailwindConfig from '../../tailwind.config'

// tailwind-merge는 커스텀 fontSize 토큰(sub3_sb_16 등)을 인식하지 못해 text-color 유틸과
// 같은 그룹으로 오인하고, 나중에 온 쪽이 앞의 text-white/text-CoolNeutral-20 등을 지워버린다.
// tailwind.config.ts의 fontSize 키를 그대로 등록해 font-size 그룹으로 분리한다.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: Object.keys(tailwindConfig.theme?.extend?.fontSize ?? {}) }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`
}

const SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 프로젝트 링크/연락처가 스킴 없이 저장된 경우(예: naver.com) next/link가 상대경로로 취급해
// /projects/naver.com 같은 내부 404로 이동하는 문제 방지. 이메일이면 mailto:, 아니면 https:// 부여.
export function toExternalHref(value: string): string {
  const trimmed = value.trim()
  if (SCHEME_REGEX.test(trimmed)) return trimmed
  if (EMAIL_REGEX.test(trimmed)) return `mailto:${trimmed}`
  return `https://${trimmed}`
}
