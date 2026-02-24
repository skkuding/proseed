//아직 미완입니다! 일단 푸시한 후 작업 이어하도록 하겠습니다! - 수린
'use client'

import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full bg-CoolNeutral-15">
      <div className="px-10 py-10">
        <div className="flex items-start justify-between gap-[10px]">
          <div className="flex items-start gap-10">
            <div className="min-w-[220px]">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/logo_white.svg"
                  alt="PROSEED"
                  width={160}
                  height={28.52}
                  className="fill-white"
                />
              </Link>
              <p className="mt-[10px] text-body4_r_14 text-neutral-80">
                © 2026. Proseed Co. all rights reserved.
              </p>
            </div>

            <nav className="flex flex-1 items-center justify-center">
              <ul className="flex items-center gap-14">
                <li>
                  <Link href="/" className="text-body1_m_16 text-neutral-95 hover:text-neutral-99">
                    메인 페이지
                  </Link>
                </li>
                <li>
                  <Link
                    href="/main/navigate"
                    className="text-body1_m_16 text-neutral-95 hover:text-neutral-99"
                  >
                    탐색하기
                  </Link>
                </li>
                <li>
                  <Link
                    href="/main/myproject"
                    className="text-body1_m_16 text-neutral-95 hover:text-neutral-99"
                  >
                    내 프로젝트
                  </Link>
                </li>
                <li>
                  <Link
                    href="/main/mypage"
                    className="text-body1_m_16 text-neutral-95 hover:text-neutral-99"
                  >
                    마이 페이지
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex min-w-55 items-center justify-end gap-3">
            <Link
              href="#"
              aria-label="Instagram"
              className="inline-flex h-15 w-15 items-center justify-center rounded-full bg-CoolNeutral-30 hover:bg-CoolNeutral-40"
            >
              <Image src="/insta.svg" alt="insta" width={24} height={24} />
            </Link>

            <Link
              href="#"
              aria-label="YouTube"
              className="inline-flex h-15 w-15 items-center justify-center rounded-full bg-CoolNeutral-30 hover:bg-CoolNeutral-40"
            >
              <Image src="/youtube.svg" alt="youtube" width={24} height={24} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
