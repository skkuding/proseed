'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      duration={2000}
      icons={{
        success: null,
        info: null,
        warning: null,
        error: null,
        loading: null,
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
