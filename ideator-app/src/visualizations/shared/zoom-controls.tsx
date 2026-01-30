import React from 'react'

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onFullscreen?: () => void
}

const buttonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-primary)',
  border: '1px solid var(--color-cyan)',
  color: 'var(--color-cyan)',
  cursor: 'pointer',
  lineHeight: 1,
}

const buttonClassName = 'text-lg'
const buttonSmClassName = 'text-sm'

export const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset, onFullscreen }) => (
  <div
    style={{
      position: 'absolute',
      top: 12,
      right: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.125rem',
      zIndex: 10,
    }}
  >
    <button className={buttonClassName} style={buttonStyle} onClick={onZoomIn} title="Zoom in">+</button>
    <button className={buttonClassName} style={buttonStyle} onClick={onZoomOut} title="Zoom out">−</button>
    <button className={buttonSmClassName} style={buttonStyle} onClick={onReset} title="Reset view">⟲</button>
    {onFullscreen && (
      <button className={buttonSmClassName} style={buttonStyle} onClick={onFullscreen} title="Fullscreen">⛶</button>
    )}
  </div>
)
