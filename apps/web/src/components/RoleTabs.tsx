export function RoleFilterTabs({
  tabs,
  activeTab,
  onTabChange,
  textSize = 'text-body1_m_16',
}: {
  tabs: readonly string[]
  activeTab: string
  onTabChange: (tab: string) => void
  textSize?: string
}) {
  const activeIndex = tabs.indexOf(activeTab)

  return (
    <div className="relative flex w-fit gap-1 rounded-full border border-neutral-95 bg-white p-1 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
      <div
        className="absolute top-1 bottom-1 rounded-full bg-CoolNeutral-15 transition-all duration-300 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${tabs.length})`,
          left: `calc(0.25rem + ${activeIndex} * (100% - 0.5rem) / ${tabs.length})`,
        }}
      />
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`relative z-10 h-[50px] w-28 rounded-full px-4 py-3 transition-colors ${textSize} ${
              isActive ? 'text-white' : 'text-black hover:text-CoolNeutral-20'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
