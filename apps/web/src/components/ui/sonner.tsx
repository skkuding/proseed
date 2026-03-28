'use client'

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#16A34A]" />,
        info: <InfoIcon className="size-4 text-[#2563EB]" />,
        warning: <TriangleAlertIcon className="size-4 text-[#D97706]" />,
        error: <OctagonXIcon className="size-4 text-[#DC2626]" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': '#ffffff',
          '--normal-text': '#303333',
          '--normal-border': '#e5e7eb',
          '--success-bg': '#64d181',
          '--success-text': '#166534',
          '--success-border': '#86EFAC',
          '--error-bg': '#9b3e44',
          '--error-text': '#991B1B',
          '--error-border': '#FCA5A5',
          '--info-bg': '#EFF6FF',
          '--info-text': '#1E3A8A',
          '--info-border': '#93C5FD',
          '--warning-bg': '#FFFBEB',
          '--warning-text': '#92400E',
          '--warning-border': '#FCD34D',
          '--border-radius': '12px',
          '--font-size': '14px',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
