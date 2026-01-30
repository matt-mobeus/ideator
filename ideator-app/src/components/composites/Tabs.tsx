import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export default function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={clsx('flex gap-0 border-b border-[var(--border-default)]', className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            'px-4 py-2 text-sm font-medium transition-all duration-[var(--transition-default)] border-b-2 -mb-px',
            activeTab === tab.id
              ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
