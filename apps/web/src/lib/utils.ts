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
