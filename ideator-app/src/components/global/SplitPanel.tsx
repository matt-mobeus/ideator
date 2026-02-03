import React from 'react';

export interface SplitPanelProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: string;
}

export function SplitPanel({
  sidebar,
  children,
  sidebarWidth = 'var(--layout-sidebar-width)',
}: SplitPanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        gap: 'var(--layout-gutter)',
        overflow: 'hidden',
      }}
    >
      <aside
        style={{
          flexShrink: 0,
          width: sidebarWidth,
          overflowY: 'auto',
        }}
      >
        {sidebar}
      </aside>
      <section
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {children}
      </section>
    </div>
  );
}
