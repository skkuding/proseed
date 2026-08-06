import Link from 'next/link'

export function RoleFilterTabs({
  tabs,
  activeTab,
  onTabChange,
  textSize = 'text-body1_m_16',
  disabledTabs = [],
  getLabel,
  getHref,
}: {
  tabs: readonly string[]
  activeTab?: string
  onTabChange: (tab: string, e?: React.MouseEvent) => void
  textSize?: string
  disabledTabs?: readonly string[]
  // 탭 값(상태 키)과 화면에 보여줄 라벨을 분리하고 싶을 때 사용 (예: '기획' 값은 유지하되 '기획자'로 표기)
  getLabel?: (tab: string) => string
  // 제공하면 button 대신 next/link로 렌더링 (헤더 내비게이션처럼 실제 페이지 이동이 필요할 때 — prefetch 이점)
  getHref?: (tab: string) => string
}) {
  const activeIndex = activeTab ? tabs.indexOf(activeTab) : -1

  return (
    <div className="relative flex w-fit gap-1 rounded-full border border-neutral-95 bg-white p-1 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
      {activeIndex >= 0 && (
        <div
          className="absolute top-1 bottom-1 rounded-full bg-CoolNeutral-15 transition-all duration-300 ease-out"
          style={{
            width: `calc((100% - 0.5rem) / ${tabs.length})`,
            left: `calc(0.25rem + ${activeIndex} * (100% - 0.5rem) / ${tabs.length})`,
          }}
        />
      )}
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        const isDisabled = disabledTabs.includes(tab)
        const className = `relative z-10 flex h-[50px] w-28 items-center justify-center rounded-full px-4 py-3 transition-colors ${textSize} ${
          isDisabled
            ? 'text-neutral-70'
            : `hover:cursor-pointer ${isActive ? 'text-white' : 'text-black hover:text-CoolNeutral-20'}`
        }`
        const label = getLabel ? getLabel(tab) : tab

        if (getHref) {
          return (
            <Link
              key={tab}
              href={getHref(tab)}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault()
                  return
                }
                onTabChange(tab, e)
              }}
              className={className}
            >
              {label}
            </Link>
          )
        }

        return (
          <button
            key={tab}
            onClick={() => !isDisabled && onTabChange(tab)}
            disabled={isDisabled}
            className={className}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
