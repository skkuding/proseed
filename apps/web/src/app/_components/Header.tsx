'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/authStore'
import { PROFILE_SRCS } from '@/app/mypage/_components/ProfileImageModal'
import { RoleFilterTabs } from '@/components/RoleTabs'

const NAV_TABS = [
  { label: '메인 페이지', href: '/' },
  { label: '탐색하기', href: '/navigate' },
  { label: '내 프로젝트', href: '/myproject' },
  { label: '마이 페이지', href: '/mypage' },
] as const

export function Header() {
  const { data: session } = authClient.useSession()
  const { openLoginModal } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const activeTab =
    NAV_TABS.find(({ href }) =>
      href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
    )?.label ?? '메인 페이지'

  const handleSignOut = async () => {
    setIsDropdownOpen(false)
    await authClient.signOut()
  }

  const profileImage =
    session?.user.image && PROFILE_SRCS.includes(session.user.image) ? session.user.image : null

  return (
    <header className="w-full">
      <div className="mx-auto flex h-[97px] max-w-[1440px] items-center justify-center">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="PROSEED"
              width={120}
              height={22}
              priority
              className="h-7 w-[140px]"
            />
          </Link>

          <nav className="flex items-center">
            <RoleFilterTabs
              tabs={NAV_TABS.map((t) => t.label)}
              activeTab={activeTab}
              onTabChange={(label) => {
                const tab = NAV_TABS.find((t) => t.label === label)
                if (!tab) return
                if (!session && (tab.href === '/mypage' || tab.href === '/myproject')) {
                  openLoginModal()
                  return
                }
                router.push(tab.href)
              }}
              textSize="text-body2_m_14"
            />
          </nav>

          {session ? (
            <div className="relative">
              {isDropdownOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              )}
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="relative z-20 inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-CoolNeutral-20 shadow-md hover:cursor-pointer border-none outline-none focus:outline-none"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="프로필"
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-sub1_sb_18 text-white">
                    {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-28 rounded-xl bg-white shadow-lg">
                  <Link
                    href="/mypage"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block w-full rounded-t-xl px-4 py-3 text-left text-body4_r_14 text-CoolNeutral-40 transition-colors hover:bg-neutral-99 hover:text-CoolNeutral-20"
                  >
                    마이 페이지
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-b-xl px-4 py-3 text-left text-body4_r_14 text-CoolNeutral-40 transition-colors hover:cursor-pointer hover:bg-neutral-99 hover:text-CoolNeutral-20"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-md hover:cursor-pointer hover:bg-neutral-99 transition-colors"
            >
              <Image src="/person_line.svg" alt="로그인" width={32} height={32} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
