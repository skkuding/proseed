import type { Metadata } from 'next'
import './globals.css'
import localFont from 'next/font/local'
import { Header } from '@/app/_components/Header'
import { Footer } from '@/app/_components/Footer'
import { MobileBlocker } from '@/app/_components/MobileBlocker'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/components/AuthProvider'
import { JsonLd } from '@/components/JsonLd'
import {
  GOOGLE_SITE_VERIFICATION,
  NAVER_SITE_VERIFICATION,
  SITE_DESCRIPTION,
  SITE_URL,
} from '@/lib/site'

/** 발급된 코드가 있을 때만 verification 태그를 내보낸다 (빈 값이면 undefined → 태그 없음). */
function buildVerification(): Metadata['verification'] {
  const verification: NonNullable<Metadata['verification']> = {}
  if (GOOGLE_SITE_VERIFICATION) {
    verification.google = GOOGLE_SITE_VERIFICATION
  }
  if (NAVER_SITE_VERIFICATION) {
    verification.other = { 'naver-site-verification': NAVER_SITE_VERIFICATION }
  }
  return Object.keys(verification).length > 0 ? verification : undefined
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PROSEED',
  url: SITE_URL,
  logo: `${SITE_URL}/logo_black.svg`,
  description: SITE_DESCRIPTION,
}

const pretendard = localFont({
  src: '../font/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PROSEED',
    template: '%s | PROSEED',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'PROSEED',
    title: 'PROSEED',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROSEED',
    description: SITE_DESCRIPTION,
  },
  verification: buildVerification(),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className={`${pretendard.className} bg-background-normal`}>
        <JsonLd data={organizationJsonLd} />
        <AuthProvider>
          <MobileBlocker />
          <Header />
          <div className="mx-auto max-w-360 px-10 pb-30">{children}</div>
          <Footer />
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
