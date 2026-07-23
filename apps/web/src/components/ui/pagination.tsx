import * as React from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { buttonVariants, type Button } from '@/components/ui/button'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-2', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({ variant: 'ghost', size }),
        'rounded-[8px] text-body1_m_16',
        isActive
          ? 'bg-CoolNeutral-20 text-white hover:bg-CoolNeutral-20 hover:text-white'
          : 'bg-white border border-neutral-95 text-black hover:bg-neutral-99',
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: Omit<React.ComponentProps<'a'>, 'children'>) {
  return (
    <a
      aria-label="Go to previous page"
      data-slot="pagination-link"
      className={cn(
        buttonVariants({ variant: 'iconCircle', size: 'icon-sm' }),
        'bg-neutral-95 mr-13',
        className
      )}
      {...props}
    >
      <Image src="/arrow2_left_grey.svg" alt="" width={16} height={16} />
    </a>
  )
}

function PaginationNext({ className, ...props }: Omit<React.ComponentProps<'a'>, 'children'>) {
  return (
    <a
      aria-label="Go to next page"
      data-slot="pagination-link"
      className={cn(
        buttonVariants({ variant: 'iconCircle', size: 'icon-sm' }),
        'bg-neutral-95 ml-13',
        className
      )}
      {...props}
    >
      <Image src="/arrow2_right_grey.svg" alt="" width={16} height={16} />
    </a>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
}
