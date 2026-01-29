import { useState, type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTab ?? tabs[0]?.id ?? '');
  const activeTab = tabs.find((t) => t.id === activeId);

  return (
    <div>
      <div className="flex border-b border-[var(--bg-tertiary)]" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            onClick={() => setActiveId(tab.id)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              tab.id === activeId
                ? 'border-[var(--accent-nav)] text-[var(--accent-nav)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">{activeTab?.content}</div>
    </div>
  );
}
