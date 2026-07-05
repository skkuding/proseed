export function FieldBadge({ type }: { type: '필수' | '선택' | '채택됨' }) {
  const styles =
    type === '필수' || type === '채택됨'
      ? 'text-primary-strong bg-primary-light'
      : 'text-CoolNeutral-40 bg-neutral-99'
  const heightClass = type === '채택됨' ? 'h-[26px]' : 'h-[34px]'
  const textSize = type === '채택됨' ? 'text-caption1_m_13' : 'text-body1_m_16'

  return (
    <span
      className={`${textSize} inline-flex items-center justify-center rounded-[4px] px-2 ${heightClass} ${styles}`}
    >
      {type}
    </span>
  )
}
