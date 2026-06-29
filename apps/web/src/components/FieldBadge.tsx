export function FieldBadge({ type }: { type: '필수' | '선택' }) {
  const styles =
    type === '필수' ? 'text-primary-strong bg-primary-light' : 'text-CoolNeutral-40 bg-neutral-99'
  return <span className={`text-caption1_m_16 rounded-[4px] px-2 py-1 ${styles}`}>{type}</span>
}
