//아직 미완입니다! 일단 푸시한 후 작업 이어하도록 하겠습니다! - 수린
'use client'

import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full bg-CoolNeutral-15">
      <div className="px-10 py-10">
        <div className="flex items-start justify-between gap-10">
          <div className="min-w-[220px]">
            <Link href="/" className="inline-flex items-center">
              <Image src="/logo.svg" alt="PROSEED" width={160} height={32} className="fill-white" />
            </Link>
            <p className="mt-[10px] text-Body/body4_r_14 text-netural-80">
              © 2026. Proseed Co. all rights reserved.
            </p>
          </div>

          <nav className="flex flex-1 items-center justify-center">
            <ul className="flex items-center gap-10">
              <li>
                <Link href="/" className="text-body2_m_14 text-black/80 hover:text-black">
                  메인 페이지
                </Link>
              </li>
              <li>
                <Link
                  href="/main/feedback"
                  className="text-body2_m_14 text-black/80 hover:text-black"
                >
                  탐색하기
                </Link>
              </li>
              <li>
                <Link
                  href="/main/projects"
                  className="text-body2_m_14 text-black/80 hover:text-black"
                >
                  내 프로젝트
                </Link>
              </li>
              <li>
                <Link
                  href="/main/mypage"
                  className="text-body2_m_14 text-black/80 hover:text-black"
                >
                  마이 페이지
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex min-w-[220px] items-center justify-end gap-3">
            <Link
              href="#"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/10 hover:bg-black/20"
            >
              <Image src="/insta.svg" alt="insta" width={18} height={18} />
            </Link>

            <Link
              href="#"
              aria-label="YouTube"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/10 hover:bg-black/20"
            >
              <Image src="/youtube.svg" alt="youtube" width={18} height={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
