import { type ReactNode } from 'react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  type?: string
  prefix?: ReactNode
  className?: string
}

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  type = 'text',
  prefix,
  className = '',
}: TextInputProps) {
  return (
    <div
      className={`relative flex items-center rounded-[8px] border border-neutral-95 px-4 py-3 focus-within:border-neutral-50 ${className}`}
    >
      {prefix && <span className="mr-2 shrink-0 text-neutral-70">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent text-body1_m_16 text-CoolNeutral-20 outline-none placeholder:text-neutral-80 ${maxLength ? 'pr-12' : ''}`}
      />
      {maxLength !== undefined && (
        <span className="absolute right-4 shrink-0 text-body1_m_16 text-CoolNeutral-20">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  )
}
