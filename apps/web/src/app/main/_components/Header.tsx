'use client'

import Image from 'next/image'
import Link from 'next/link'
import { NavLink } from './NavLink'

export function Header() {
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
            <div className="flex items-center h-[58px] w-[460px] shrink-0 rounded-full p-[6px] bg-white shadow-md">
              <NavLink href="/" text="메인 페이지" />
              <NavLink href="/navigate" text="탐색하기" />
              <NavLink href="/myproject" text="내 프로젝트" />
              <NavLink href="/mypage" text="마이 페이지" />
            </div>
          </nav>

          <Link
            href="/mypage"
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-md"
          >
            <Image src="/person_line.svg" alt="계정" width={32} height={32} />
          </Link>
        </div>
      </div>
    </header>
  )
}
