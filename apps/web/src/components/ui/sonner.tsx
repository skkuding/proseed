'use client'

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      duration={2000}
      icons={{
        success: <CircleCheckIcon className="size-[18px] text-[#16A34A]" />,
        info: <InfoIcon className="size-[18px] text-[#2563EB]" />,
        warning: <TriangleAlertIcon className="size-[18px] text-[#D97706]" />,
        error: <OctagonXIcon className="size-[18px] text-[#DC2626]" />,
        loading: <Loader2Icon className="size-[18px] animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'w-[360px] !rounded-xl !shadow-[0_4px_20px_0_rgba(0,0,0,0.10)] !border !text-[14px] font-pretendard',
          success: '!bg-[#F0FFF4] !text-[#166534] !border-[#BBF7D0]',
          error: '!bg-[#FFF1F2] !text-[#9F1239] !border-[#FECDD3]',
          info: '!bg-[#EFF6FF] !text-[#1E3A8A] !border-[#BFDBFE]',
          warning: '!bg-[#FFFBEB] !text-[#92400E] !border-[#FDE68A]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
