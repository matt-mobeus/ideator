import React from 'react'

interface TooltipProps {
  content: string | null
  position: { x: number; y: number } | null
}

export const Tooltip: React.FC<TooltipProps> = ({ content, position }) => {
  if (!content || !position) return null
  return (
    <div
      className="px-2.5 py-1.5 text-sm"
      style={{
        position: 'fixed',
        left: position.x + 12,
        top: position.y + 12,
        background: 'var(--bg-primary)',
        border: '1px solid var(--color-cyan)',
        color: 'var(--text-primary)',
        pointerEvents: 'none',
        zIndex: 1000,
        maxWidth: 260,
        boxShadow: '0 0 8px rgba(0,255,255,0.15)',
      }}
    >
      {content}
    </div>
  )
}
