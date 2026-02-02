import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'full';
}

export function PageLayout({ children, variant = 'default' }: PageLayoutProps) {
  const style: React.CSSProperties = variant === 'default'
    ? { padding: 'var(--layout-gutter)' }
    : { padding: 0 };

  return (
    <div className="flex min-h-full flex-col" style={style}>
      {children}
    </div>
  );
}
