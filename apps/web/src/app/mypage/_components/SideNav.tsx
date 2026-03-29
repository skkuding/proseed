'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

type MenuItem = 'profile' | 'account' | 'faq'

interface SideNavProps {
  activeMenu: MenuItem
  onMenuChange: (menu: MenuItem) => void
}

export function SideNav({ activeMenu, onMenuChange }: SideNavProps) {
  const items: { key: MenuItem; icon: string; label: string }[] = [
    { key: 'profile', icon: '/person_fill_grey.svg', label: '내 프로필' },
    { key: 'account', icon: '/setting_fill_grey.svg', label: '계정 관리' },
    { key: 'faq', icon: '/question_fill_grey.svg', label: 'FAQ · 고객센터' },
  ]

  return (
    <div className="rounded-[12px] bg-white p-5 gap-3">
      {items.map(({ key, icon, label }) => (
        <button
          key={key}
          onClick={() => onMenuChange(key)}
          className={cn(
            'flex w-full items-center justify-between rounded-[8px] px-2 py-[14px] transition-colors hover:bg-neutral-99',
            activeMenu === key && 'bg-CoolNeutral-99'
          )}
        >
          <div className="flex items-center gap-3">
            <Image src={icon} alt={label} width={28} height={28} />
            <span className="text-title6_m_20">{label}</span>
          </div>
          <Image src="/arrow2_right_grey.svg" alt="arrow" width={28} height={28} />
        </button>
      ))}
    </div>
  )
}
