import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

/**
 * Main layout wrapper with top nav and scrollable content area.
 * Uses full viewport height and CSS vars from tokens.css.
 */
export default function AppShell({ children }: AppShellProps) {
  return (
    <div
      className="flex h-screen w-full flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {children}
    </div>
  )
}
