/**
 * Full-screen centered loader with IDEATOR branding and glow-pulse animation.
 */
export function FullScreenLoader() {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="text-center">
        <div
          className="text-4xl font-bold tracking-wider animate-glow-pulse"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cyan)' }}
        >
          IDEATOR
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div
            className="h-1 w-24 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--color-cyan)', opacity: 'var(--opacity-disabled)' }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Section loader with skeleton wireframes (3 bars).
 */
export function SectionLoader() {
  return (
    <div className="flex flex-col gap-3 p-6">
      <div
        className="h-4 w-3/4 rounded animate-pulse"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      />
      <div
        className="h-4 w-full rounded animate-pulse"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      />
      <div
        className="h-4 w-5/6 rounded animate-pulse"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      />
    </div>
  )
}

/**
 * Small inline spinning circle.
 */
export function InlineSpinner() {
  return (
    <div
      className="h-4 w-4 animate-spin rounded-full border-2 border-transparent"
      style={{
        borderTopColor: 'var(--color-cyan)',
        borderRightColor: 'var(--color-cyan)',
      }}
    />
  )
}
