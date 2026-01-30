import type { ReactNode } from 'react'

interface MobileBlockProps {
  children: ReactNode
}

/**
 * Shows "Please use desktop or tablet" message on mobile viewports (< 768px).
 * Renders children on larger screens.
 */
export default function MobileBlock({ children }: MobileBlockProps) {
  return (
    <>
      {/* Mobile blocker: visible below 768px */}
      <div className="flex h-screen w-full items-center justify-center md:hidden">
        <div className="max-w-sm px-6 text-center">
          <h1
            className="text-3xl font-bold tracking-wider"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cyan)' }}
          >
            IDEATOR
          </h1>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            This application requires a desktop or tablet device.
            <br />
            Please access from a larger screen.
          </p>
        </div>
      </div>

      {/* App content: hidden below 768px, visible at md breakpoint and above */}
      <div className="hidden h-screen w-full md:block">
        {children}
      </div>
    </>
  )
}
