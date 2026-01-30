import React, { useEffect, useRef } from 'react'

interface ContextMenuItem {
  label: string
  onClick: () => void
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  position: { x: number; y: number } | null
  onClose: () => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, onClose }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!position) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [position, onClose])

  if (!position || items.length === 0) return null

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        background: 'var(--bg-primary)',
        border: '1px solid var(--color-cyan)',
        zIndex: 1000,
        minWidth: 140,
        boxShadow: '0 0 12px rgba(0,255,255,0.1)',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => { item.onClick(); onClose() }}
          className="px-3.5 py-2 text-sm cursor-pointer"
          style={{
            color: 'var(--text-primary)',
            borderBottom: i < items.length - 1 ? '1px solid rgba(0,255,255,0.15)' : undefined,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}
