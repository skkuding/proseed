'use client'

import { cn } from '@/lib/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps<T extends string> {
  href: Route<T>
  text: string
}

export function NavLink<T extends string>({ href, text }: NavLinkProps<T>) {
  const pathname = usePathname()
  const h = String(href)

  const active = h === '/' ? pathname === '/' : pathname === h || pathname.startsWith(h + '/')

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex-1 h-full inline-flex items-center justify-center rounded-full px-4 py-3 transition-colors whitespace-nowrap',
        active ? 'bg-black text-white' : 'text-black hover:bg-black/5'
      )}
    >
      {text}
    </Link>
  )
}
