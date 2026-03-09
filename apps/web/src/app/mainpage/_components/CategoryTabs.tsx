const categories = [
  '전체',
  '웹·서비스',
  '금융·경제',
  '헬스케어',
  '교육',
  '엔터테인먼트',
  '모빌리티',
  '에너지·환경',
  '부동산·건설',
]

export default function CategoryTabs() {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category, index) => (
        <button
          key={category}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            index === 0 ? 'bg-black text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
