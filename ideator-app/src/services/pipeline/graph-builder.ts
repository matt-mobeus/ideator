import type { ExecutionPlan, PipelineOptions, TaskNode, TaskType } from './types.ts'
import type { FileFormat } from '@/types/file.ts'

interface FileInput {
  blob: Blob
  name: string
  format: FileFormat
}

let taskCounter = 0

export function buildTaskGraph(files: FileInput[], options: PipelineOptions): ExecutionPlan {
  const planId = crypto.randomUUID()
  const tasks: Record<string, TaskNode> = {}
  const now = Date.now()

  // Helper to create a task node
  function addTask<T extends TaskType>(type: T, dependencies: string[], input: unknown = null): string {
    const id = `${type}-${planId.slice(0, 8)}-${taskCounter++}`
    tasks[id] = {
      id,
      type,
      dependencies,
      status: 'pending',
      input: input as any,
      output: null,
      error: null,
      retryCount: 0,
      tokenUsage: null,
      timestamps: { queued: now, started: null, completed: null },
    }
    return id
  }

  // Phase 1: Text extraction (no LLM, local processing)
  const extractId = addTask('text-extraction', [], {
    files: files.map(f => ({ blob: f.blob, name: f.name, format: f.format })),
  })

  // Phase 2: Concept extraction (LLM)
  const conceptId = addTask('concept-extraction', [extractId], {
    texts: [], // will be populated by orchestrator from extraction output
    domain: options.domain,
  })

  // Phase 3: Clustering (LLM)
  const clusterId = addTask('clustering', [conceptId])

  // Phase 4: Optional parallel outputs (all depend on clustering)
  const optionalTasks: Array<{ flag: keyof PipelineOptions; type: TaskType }> = [
    { flag: 'generateDocument', type: 'document-generation' },
    { flag: 'generateVisual', type: 'visual-generation' },
    { flag: 'trackProvenance', type: 'provenance-tracking' },
    { flag: 'generateTimeline', type: 'timeline-generation' },
    { flag: 'generateNodeMap', type: 'node-map-generation' },
  ]

  for (const { flag, type } of optionalTasks) {
    if (options[flag]) {
      addTask(type, [clusterId])
    }
  }

  // Build execution order via topological sort
  const executionOrder = topologicalSort(tasks)

  return {
    id: planId,
    tasks,
    executionOrder,
    status: 'idle',
    createdAt: now,
    completedAt: null,
  }
}

/** Simple topological sort using Kahn's algorithm */
function topologicalSort(tasks: Record<string, TaskNode>): string[] {
  const inDegree: Record<string, number> = {}
  const adjacency: Record<string, string[]> = {}

  for (const id of Object.keys(tasks)) {
    inDegree[id] = tasks[id].dependencies.length
    adjacency[id] = []
  }

  // Build adjacency: if B depends on A, A -> B
  for (const task of Object.values(tasks)) {
    for (const dep of task.dependencies) {
      if (adjacency[dep]) {
        adjacency[dep].push(task.id)
      }
    }
  }

  const queue = Object.keys(tasks).filter(id => inDegree[id] === 0)
  const order: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    order.push(current)
    for (const neighbor of adjacency[current]) {
      inDegree[neighbor]--
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
      }
    }
  }

  if (order.length !== Object.keys(tasks).length) {
    throw new Error('Cycle detected in task dependency graph')
  }

  return order
}
