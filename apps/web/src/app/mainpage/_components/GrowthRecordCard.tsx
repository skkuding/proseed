interface GrowthRecordCardProps {
  title?: string
  category?: string
  date?: string
}

export default function GrowthRecordCard({
  title = '첫 MVP 배포 완료',
  category = '회고',
  date = '2026. 01. 01',
}: GrowthRecordCardProps) {
  return (
    <article className="rounded-[20px] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-200" />
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-black">{title}</h3>
            <span className="text-sm text-gray-400">{category}</span>
          </div>
        </div>

        <p className="text-sm leading-6 text-gray-500">
          성장기록 내용이 들어갈 자리입니다. 이후 실제 데이터와 연결하면 됩니다.
        </p>

        <span className="text-xs text-gray-400">{date}</span>
      </div>
    </article>
  )
}
