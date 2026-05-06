import GrowthRecordCard from './GrowthRecordCard'
import SectionTitle from './SectionTitle'

const tabs = ['기획', '디자인', '프론트엔드', '백엔드', '기타']

export default function GrowthRecordSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionTitle title="최근 업데이트 된 성장기록" />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              index === 0 ? 'bg-black text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <GrowthRecordCard />
        <GrowthRecordCard />
        <GrowthRecordCard />
      </div>
    </section>
  )
}
