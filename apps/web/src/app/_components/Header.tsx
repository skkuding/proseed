'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/authStore'
import { RoleFilterTabs } from '@/components/RoleTabs'
import { trackEvent } from '@/lib/analytics'
import { getMyProfile, type MyProfile } from '@/lib/api'
import { JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'

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
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // nav에 없는 라우트(/privacy 등)에서는 어떤 탭도 활성화하지 않는다 (undefined).
  const activeTab = NAV_TABS.find(({ href }) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
  )?.label

  useEffect(() => {
    if (!session) return
    getMyProfile().then(setProfile).catch(console.error)
  }, [session])

  const handleSignOut = async () => {
    setIsDropdownOpen(false)
    await authClient.signOut()
  }

  const jobLabel = profile?.jobType ? JOB_API_TO_LABEL[profile.jobType] : null

  return (
    <header className="w-full">
      <div className="mx-auto flex h-[97px] max-w-[1440px] items-center justify-center">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo_black.svg"
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
                className="relative z-20 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-md hover:cursor-pointer hover:bg-neutral-99 transition-colors border-none outline-none focus:outline-none"
              >
                <Image src="/person_line.svg" alt="프로필" width={32} height={32} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-65 rounded-[12px] bg-white p-5 shadow-lg">
                  <div className="flex items-center gap-2">
                    {profile?.profileImageUrl ? (
                      <Image
                        src={profile.profileImageUrl}
                        alt="프로필"
                        width={40}
                        height={40}
                        unoptimized
                        className="size-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-10 shrink-0 rounded-full bg-CoolNeutral-90" />
                    )}
                    <div className="flex min-w-0 flex-col gap-[2px]">
                      <p className="truncate text-sub1_sb_18">
                        {profile?.name ?? session.user.name}
                      </p>
                      {jobLabel && (
                        <p className="truncate text-caption2_m_12 text-neutral-40">{jobLabel}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <Link
                      href="/mypage"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center justify-between rounded-lg py-2 text-body1_m_16 hover:cursor=pointer"
                    >
                      마이페이지
                      <Image src="/arrow2_right_grey.svg" alt="" width={20} height={20} />
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-between rounded-lg py-2 text-left text-body1_m_16 transition-colors hover:cursor-pointer"
                    >
                      로그아웃
                      <Image src="/arrow2_right_grey.svg" alt="" width={20} height={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                trackEvent('cta_clicked', { location: 'header' })
                openLoginModal()
              }}
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
