import type { SourceRef } from './concept.ts'

export type TimelineNodeType = 'ORIGIN' | 'VARIATION' | 'MERGE' | 'CURRENT' | 'PROJECTED'
export type DatePrecision = 'EXACT' | 'YEAR' | 'DECADE' | 'ESTIMATED'
export type RelationshipType = 'DERIVED' | 'MERGED' | 'INFLUENCED' | 'CITED' | 'FUNDED' | 'COMPETED'
export type NodeMapNodeType = 'CONCEPT' | 'PATENT' | 'PUBLICATION' | 'PERSON' | 'COMPANY' | 'EVENT'
export type EdgeStyle = 'CREATED' | 'REFERENCED' | 'FUNDED_EDGE' | 'AFFILIATED' | 'COMPETED_EDGE'

export interface TimelineNode {
  id: string
  conceptId: string
  nodeType: TimelineNodeType
  label: string
  date: Date
  datePrecision: DatePrecision
  description: string
  sourceRefs: SourceRef[]
  position: { x: number; y: number }
}

export interface TimelineEdge {
  id: string
  sourceNodeId: string
  targetNodeId: string
  relationshipType: RelationshipType
  strength: number
  evidence: string
  sourceRefs: SourceRef[]
}

export interface NodeMapNode {
  id: string
  label: string
  nodeType: NodeMapNodeType
  conceptId?: string
  position: { x: number; y: number }
  metadata: Record<string, string>
}

export interface NodeMapEdge {
  id: string
  sourceId: string
  targetId: string
  edgeStyle: EdgeStyle
  label?: string
}

export interface VisualizationData {
  id: string
  conceptId: string
  timelineNodes: TimelineNode[]
  timelineEdges: TimelineEdge[]
  nodeMapNodes: NodeMapNode[]
  nodeMapEdges: NodeMapEdge[]
  generatedAt: Date
}
