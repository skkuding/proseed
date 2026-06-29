import type { Metadata } from 'next'
import './globals.css'
import localFont from 'next/font/local'
import { Header } from '@/app/_components/Header'
import { Footer } from '@/app/_components/Footer'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/components/AuthProvider'

const pretendard = localFont({
  src: '../font/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
})

export const metadata: Metadata = {
  title: 'PROSEED',
  description: 'Proseed Now!!!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={pretendard.variable}>
      <body className={`${pretendard.className} bg-background-normal`}>
        <AuthProvider>
          <Header />
          <div className="mx-auto max-w-360 px-10 pb-30">{children}</div>
          <Footer />
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
