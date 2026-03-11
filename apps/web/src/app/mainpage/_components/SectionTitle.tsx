interface SectionTitleProps {
  title: string
  actionLabel?: string
}

export default function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-head1_sb_42">{title}</h2>
    </div>
  )
}
