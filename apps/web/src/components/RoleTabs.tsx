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
  return (
    <div className="flex gap-1 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] bg-white border-neutral-200 rounded-full p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`w-28 h-[50px] px-4 py-3 hover:cursor-pointer rounded-full ${textSize} transition-colors ${
            activeTab === tab
              ? 'bg-CoolNeutral-15 text-white'
              : 'text-black hover:text-CoolNeutral-20'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
