import type { Concept, Cluster, SourceRef } from '@/types/concept.ts'
import type { GeneratedAsset, ProvenanceChain } from '@/types/asset.ts'
import type { TimelineNode, TimelineEdge, NodeMapNode, NodeMapEdge } from '@/types/visualization.ts'
import type { FileFormat } from '@/types/file.ts'

// Task type registry — maps task type to its input/output
export interface TaskIO {
  'text-extraction': {
    input: { files: Array<{ blob: Blob; name: string; format: FileFormat }> }
    output: Array<{ text: string; sourceRef: SourceRef }>
  }
  'concept-extraction': {
    input: { texts: Array<{ text: string; sourceRef: SourceRef }>; domain?: string }
    output: { concepts: Concept[] }
  }
  'clustering': {
    input: { concepts: Concept[] }
    output: { clusters: Cluster[] }
  }
  'document-generation': {
    input: { concept: Concept; analysis?: unknown }
    output: { asset: GeneratedAsset }
  }
  'visual-generation': {
    input: { concept: Concept; analysis?: unknown }
    output: { asset: GeneratedAsset }
  }
  'provenance-tracking': {
    input: { content: string; concept: Concept }
    output: { chain: ProvenanceChain }
  }
  'timeline-generation': {
    input: { concept: Concept }
    output: { nodes: TimelineNode[]; edges: TimelineEdge[] }
  }
  'node-map-generation': {
    input: { concept: Concept }
    output: { nodes: NodeMapNode[]; edges: NodeMapEdge[] }
  }
}

export type TaskType = keyof TaskIO

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface TaskNode<T extends TaskType = TaskType> {
  id: string
  type: T
  dependencies: string[]
  status: TaskStatus
  input: TaskIO[T]['input'] | null
  output: TaskIO[T]['output'] | null
  error: string | null
  retryCount: number
  tokenUsage: { prompt: number; completion: number } | null
  timestamps: {
    queued: number
    started: number | null
    completed: number | null
  }
}

export interface ExecutionPlan {
  id: string
  tasks: Record<string, TaskNode>
  executionOrder: string[]
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused'
  createdAt: number
  completedAt: number | null
}

export interface PipelineOptions {
  domain?: string
  generateDocument?: boolean
  generateVisual?: boolean
  trackProvenance?: boolean
  generateTimeline?: boolean
  generateNodeMap?: boolean
}
