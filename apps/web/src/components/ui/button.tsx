import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md whitespace-nowrap transition-all outline-none cursor-pointer disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // bg-neutral-95/text-neutral-70 회색으로 바뀌는 disabled 버튼 — pointer-events-none을 빼서 disabled:cursor-not-allowed가 실제로 보이게 한다
        default:
          'bg-CoolNeutral-20 text-white not-disabled:hover:bg-CoolNeutral-30 disabled:opacity-100 disabled:bg-neutral-95 disabled:text-neutral-70 disabled:cursor-not-allowed',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 disabled:pointer-events-none',
        // bg-neutral-95/text-neutral-70 회색으로 바뀌는 disabled 버튼 — pointer-events-none을 빼서 disabled:cursor-not-allowed가 실제로 보이게 한다
        outline:
          'bg-white text-CoolNeutral-20 border-[1.4px] border-CoolNeutral-50 not-disabled:hover:bg-neutral-99 disabled:opacity-100 disabled:bg-neutral-95 disabled:text-neutral-70 disabled:border-none disabled:cursor-not-allowed',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:pointer-events-none',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 disabled:pointer-events-none',
        link: 'text-primary underline-offset-4 hover:underline disabled:pointer-events-none',
        // 모달 닫기 등 배경/테두리 없는 아이콘·텍스트 버튼. size="bare"와 짝을 이룬다.
        iconMuted:
          'text-CoolNeutral-40 hover:text-CoolNeutral-20 transition-colors disabled:pointer-events-none',
        // 캐러셀 이전/다음 같은 원형 아이콘 버튼. size="icon-sm"과 짝을 이룬다.
        iconCircle:
          'rounded-full border border-neutral-200 text-CoolNeutral-40 hover:bg-neutral-99 disabled:opacity-30 disabled:pointer-events-none',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        lg: 'h-13 rounded-[8px] px-5 py-[15px]',
        md: 'h-12 rounded-[8px] px-5 py-[13px]',
        sm: 'h-12 rounded-[8px] px-4 py-3',
        xs: 'h-10 rounded-[8px] px-3 py-[10px]',
        // 크기를 className에 전부 맡기는 리셋 (아이콘 전용 ghost 버튼용)
        bare: 'h-auto w-auto p-0',
        icon: 'size-9',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
