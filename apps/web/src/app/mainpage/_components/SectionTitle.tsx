interface SectionTitleProps {
  title: string
  actionLabel?: string
}

export default function SectionTitle({ title, actionLabel }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[28px] font-bold leading-none text-black">{title}</h2>
      {actionLabel ? (
        <button className="text-sm font-medium text-gray-500">{actionLabel}</button>
      ) : null}
    </div>
  )
}
