export function RoleFilterTabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: readonly string[]
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  return (
    <div className="flex gap-1 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] bg-white border-neutral-200 rounded-full p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-5 py-2 hover:cursor-pointer rounded-full text-body1_m_16 transition-colors ${
            activeTab === tab
              ? 'bg-CoolNeutral-20 text-white'
              : 'text-CoolNeutral-40 hover:text-CoolNeutral-20'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
