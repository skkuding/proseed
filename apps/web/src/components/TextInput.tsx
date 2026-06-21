import { type ReactNode } from 'react'
import Image from 'next/image'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  type?: string
  prefix?: ReactNode
  suffix?: ReactNode
  className?: string
}

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  type = 'text',
  prefix,
  suffix,
  className = '',
}: TextInputProps) {
  const isAtMax = maxLength !== undefined && value.length >= maxLength
  const showCounter = maxLength !== undefined && !suffix

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div
        className={`relative flex items-center rounded-[8px] border px-4 py-3 ${
          isAtMax && showCounter
            ? 'border-[#FF754F]'
            : 'border-neutral-95 focus-within:border-neutral-50'
        }`}
      >
        {prefix && <span className="mr-2 shrink-0 text-neutral-70">{prefix}</span>}
        <input
          type={type}
          value={value}
          maxLength={maxLength}
          onChange={(e) =>
            onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)
          }
          placeholder={placeholder}
          className={`min-w-0 flex-1 bg-transparent text-body1_m_16 text-CoolNeutral-20 outline-none placeholder:text-neutral-80 placeholder:text-ellipsis ${showCounter || suffix ? 'pr-12' : ''}`}
        />
        {showCounter && (
          <span
            className={`absolute right-4 shrink-0 text-body1_m_16 ${
              isAtMax ? 'text-[#FF754F]' : 'text-CoolNeutral-20'
            }`}
          >
            {value.length}/{maxLength}
          </span>
        )}
        {suffix && <span className="absolute right-4 shrink-0">{suffix}</span>}
      </div>
      {isAtMax && showCounter && (
        <div className="flex items-center gap-1">
          <Image src="/info_primary_strong.svg" width={13} height={13} alt="" />
          <span className="text-caption1_m_13 text-primary-strong">
            최대 {maxLength}자 이내로 작성해주세요
          </span>
        </div>
      )}
    </div>
  )
}
