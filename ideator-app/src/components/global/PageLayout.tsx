import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'full';
}

export function PageLayout({ children, variant = 'default' }: PageLayoutProps) {
  if (variant === 'full') {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col" style={{ padding: 'var(--layout-gutter)' }}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
