import type { NodeMapNodeType, TimelineNodeType, EdgeStyle } from '../../types/visualization'

export function nodeTypeColor(type: NodeMapNodeType): string {
  const map: Record<NodeMapNodeType, string> = {
    CONCEPT: 'var(--color-cyan)',
    PATENT: 'var(--color-magenta)',
    PUBLICATION: 'var(--color-green)',
    PERSON: 'var(--color-orange)',
    COMPANY: 'var(--color-yellow)',
    EVENT: 'var(--text-primary)',
  }
  return map[type]
}

export function timelineNodeColor(type: TimelineNodeType): string {
  const map: Record<TimelineNodeType, string> = {
    ORIGIN: 'var(--color-cyan)',
    VARIATION: 'var(--color-green)',
    MERGE: 'var(--color-magenta)',
    CURRENT: 'var(--color-orange)',
    PROJECTED: 'var(--color-yellow)',
  }
  return map[type]
}

export function edgeColor(style: EdgeStyle): string {
  const map: Record<EdgeStyle, string> = {
    CREATED: 'var(--color-cyan)',
    REFERENCED: 'var(--color-green)',
    FUNDED_EDGE: 'var(--color-orange)',
    AFFILIATED: 'var(--text-primary)',
    COMPETED_EDGE: 'var(--color-magenta)',
  }
  return map[style]
}
