import Icon from '@/components/ui/Icon.tsx'

interface TopNavProps {
  onSearchClick?: () => void
  onSettingsClick?: () => void
}

/**
 * Persistent top navigation bar.
 * Left: IDEATOR branding
 * Right: search (Cmd+K), settings, help buttons
 */
export default function TopNav({ onSearchClick, onSettingsClick }: TopNavProps) {
  return (
    <nav
      className="flex h-14 w-full items-center justify-between border-b px-6 shrink-0"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Left: Branding */}
      <div
        className="text-xl font-bold tracking-wider"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cyan)' }}
      >
        IDEATOR
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-2">
        {/* Search button with Cmd+K hint */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Search"
        >
          <Icon name="search" size={16} />
          <span className="hidden lg:inline">
            <kbd
              className="rounded px-1.5 py-0.5 text-xs font-mono"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Cmd+K
            </kbd>
          </span>
        </button>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className="flex items-center justify-center rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Settings"
        >
          <Icon name="settings" size={20} />
        </button>

        {/* Help button */}
        <button
          className="flex items-center justify-center rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Help"
        >
          <Icon name="help" size={20} />
        </button>
      </div>
    </nav>
  )
}
