import FeedbackCard from './FeedbackCard'
import SectionTitle from './SectionTitle'

export default function FeedbackSection() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="최근 피드백을 모아봤어요" />
        <div className="flex gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
            ◀
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
            ▶
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FeedbackCard />
        <FeedbackCard />
        <FeedbackCard />
      </div>
    </section>
  )
}
