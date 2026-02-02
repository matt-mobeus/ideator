/**
 * Pipeline orchestrator — walks the task DAG, dispatches runnable tasks
 * respecting dependencies, handles parallelism, retries, and error cascading.
 */

import type { ExecutionPlan, TaskNode, TaskIO } from './types.ts'
import type { PipelineStore } from './store.ts'
import type { LlmConfig } from '@/types/settings.ts'
import type { LlmProvider } from '@/network/llm/types.ts'
import { createLlmProvider } from '@/network/llm/factory.ts'
import { logger } from '@/utils/logger.ts'

export type PipelineListener = (plan: ExecutionPlan) => void

export class PipelineOrchestrator {
  private plan: ExecutionPlan
  private llmConfig: LlmConfig
  private store: PipelineStore
  private listeners: Set<PipelineListener> = new Set()
  private abortController: AbortController
  private maxConcurrency = 3
  private maxRetries = 2

  constructor(plan: ExecutionPlan, llmConfig: LlmConfig, store: PipelineStore) {
    this.plan = plan
    this.llmConfig = llmConfig
    this.store = store
    this.abortController = new AbortController()
  }

  async run(): Promise<ExecutionPlan> {
    this.plan.status = 'running'
    await this.persist()

    while (this.hasWork()) {
      if (this.abortController.signal.aborted) {
        this.plan.status = 'paused'
        await this.persist()
        return this.plan
      }

      const runnable = this.getRunnableTasks()
      if (runnable.length === 0) {
        // All remaining tasks are either running or blocked — wait for in-flight
        await new Promise(r => setTimeout(r, 100))
        continue
      }

      const batch = runnable.slice(0, this.maxConcurrency)
      await Promise.allSettled(batch.map(task => this.executeTask(task)))
    }

    const anyFailed = Object.values(this.plan.tasks).some(t => t.status === 'failed')
    this.plan.status = anyFailed ? 'failed' : 'completed'
    this.plan.completedAt = Date.now()
    await this.persist()
    return this.plan
  }

  pause(): void {
    this.abortController.abort()
  }

  getPlan(): ExecutionPlan {
    return this.plan
  }

  subscribe(fn: PipelineListener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private hasWork(): boolean {
    return Object.values(this.plan.tasks).some(
      t => t.status === 'pending' || t.status === 'running',
    )
  }

  private getRunnableTasks(): TaskNode[] {
    return Object.values(this.plan.tasks).filter(task => {
      if (task.status !== 'pending') return false
      return task.dependencies.every(
        depId => this.plan.tasks[depId]?.status === 'completed',
      )
    })
  }

  private async executeTask(task: TaskNode): Promise<void> {
    task.status = 'running'
    task.timestamps.started = Date.now()
    this.notify()
    await this.persist()

    try {
      this.resolveInput(task)

      const provider = createLlmProvider(this.llmConfig)
      const output = await this.dispatchTask(task, provider, this.abortController.signal)

      task.output = output as TaskNode['output']
      task.status = 'completed'
      task.timestamps.completed = Date.now()
    } catch (err) {
      logger.error(`Pipeline task ${task.type} failed`, { data: err })

      if (task.retryCount < this.maxRetries) {
        task.retryCount++
        task.status = 'pending' // retry on next loop iteration
      } else {
        task.status = 'failed'
        task.error = err instanceof Error ? err.message : String(err)
        task.timestamps.completed = Date.now()
        this.skipDependents(task.id)
      }
    }

    this.notify()
    await this.persist()
  }

  /**
   * Dispatches a task to the appropriate service function.
   * Dynamic imports keep the orchestrator lean and allow tree-shaking.
   */
  private async dispatchTask(task: TaskNode, provider: LlmProvider, _signal?: AbortSignal): Promise<unknown> {
    switch (task.type) {
      case 'text-extraction': {
        const { processTextFile } = await import('@/workers/text-processor.ts')
        const input = task.input as TaskIO['text-extraction']['input']
        const results: TaskIO['text-extraction']['output'] = []
        for (const file of input.files) {
          const text = await processTextFile(file.blob, file.format)
          results.push({
            text,
            sourceRef: {
              fileId: crypto.randomUUID(),
              fileName: file.name,
              location: '',
              excerpt: text.slice(0, 200),
              context: '',
            },
          })
        }
        return results
      }

      case 'concept-extraction': {
        const { extractFromMultipleFiles } = await import(
          '@/services/concept-extraction.service.ts'
        )
        const input = task.input as TaskIO['concept-extraction']['input']
        const concepts = await extractFromMultipleFiles(
          input.texts,
          this.llmConfig,
          input.domain,
        )
        return { concepts }
      }

      case 'clustering': {
        const { clusterConcepts } = await import('@/services/clustering.service.ts')
        const input = task.input as TaskIO['clustering']['input']
        const clusters = await clusterConcepts(input.concepts, this.llmConfig)
        return { clusters }
      }

      case 'document-generation': {
        const { generateDocument } = await import('@/services/document-generator.ts')
        const input = task.input as TaskIO['document-generation']['input']
        const asset = await generateDocument(
          'executive_summary',
          input.concept,
          provider,
          input.analysis as import('@/types/analysis.ts').AnalysisResult | undefined,
        )
        return { asset }
      }

      case 'visual-generation': {
        const { generateVisual } = await import('@/services/visual-generator.ts')
        const input = task.input as TaskIO['visual-generation']['input']
        const asset = await generateVisual(
          'concept_diagram',
          input.concept,
          provider,
          input.analysis as import('@/types/analysis.ts').AnalysisResult | undefined,
        )
        return { asset }
      }

      case 'provenance-tracking': {
        const { extractProvenance } = await import('@/services/provenance-tracker.ts')
        const input = task.input as TaskIO['provenance-tracking']['input']
        const chain = await extractProvenance(input.content, input.concept, provider)
        return { chain }
      }

      case 'timeline-generation': {
        const { generateTimeline } = await import('@/services/timeline-data.service.ts')
        const input = task.input as TaskIO['timeline-generation']['input']
        return await generateTimeline(input.concept, provider)
      }

      case 'node-map-generation': {
        const { generateNodeMap } = await import('@/services/node-map-data.service.ts')
        const input = task.input as TaskIO['node-map-generation']['input']
        return await generateNodeMap(input.concept, provider)
      }

      default:
        throw new Error(`Unknown task type: ${(task as TaskNode).type}`)
    }
  }

  /**
   * Wires outputs from completed dependencies into the current task's input.
   *
   * NOTE: The current linear pipeline topology guarantees each task has 0 or 1
   * dependency. Only `task.dependencies[0]` is read. If multi-dependency fan-in
   * is added in the future, this method must be updated to merge multiple outputs.
   */
  private resolveInput(task: TaskNode): void {
    if (task.dependencies.length === 0) return
    if (task.dependencies.length > 1) {
      logger.warn('Multiple dependencies not yet supported — using first only', { context: 'pipeline' })
    }

    const depId = task.dependencies[0]
    const dep = this.plan.tasks[depId]
    const depOutput = dep?.output

    if (!depOutput) {
      throw new Error(`Dependency ${depId} has no output`)
    }

    switch (task.type) {
      case 'concept-extraction': {
        // text-extraction output is Array<{text, sourceRef}>
        const texts = depOutput as TaskIO['text-extraction']['output']
        const existing = task.input as TaskIO['concept-extraction']['input'] | null
        task.input = { texts, domain: existing?.domain } as TaskIO['concept-extraction']['input']
        break
      }

      case 'clustering': {
        const { concepts } = depOutput as TaskIO['concept-extraction']['output']
        task.input = { concepts } as TaskIO['clustering']['input']
        break
      }

      case 'document-generation':
      case 'visual-generation': {
        // Upstream is clustering; walk back to concept-extraction for concepts
        const conceptDepId = dep?.dependencies?.[0]
        const conceptOutput = conceptDepId
          ? (this.plan.tasks[conceptDepId]?.output as TaskIO['concept-extraction']['output'] | null)
          : null
        const firstConcept = conceptOutput?.concepts?.[0] ?? null
        if (!firstConcept) throw new Error(`No concepts available for ${task.type}`)
        task.input = { concept: firstConcept, analysis: undefined } as TaskIO['document-generation']['input']
        break
      }

      case 'provenance-tracking': {
        const conceptDepId = dep?.dependencies?.[0]
        const conceptOutput = conceptDepId
          ? (this.plan.tasks[conceptDepId]?.output as TaskIO['concept-extraction']['output'] | null)
          : null
        const firstConcept = conceptOutput?.concepts?.[0] ?? null
        if (!firstConcept) throw new Error(`No concepts available for ${task.type}`)
        task.input = { content: '', concept: firstConcept } as TaskIO['provenance-tracking']['input']
        break
      }

      case 'timeline-generation':
      case 'node-map-generation': {
        const conceptDepId = dep?.dependencies?.[0]
        const conceptOutput = conceptDepId
          ? (this.plan.tasks[conceptDepId]?.output as TaskIO['concept-extraction']['output'] | null)
          : null
        const firstConcept = conceptOutput?.concepts?.[0] ?? null
        if (!firstConcept) throw new Error(`No concepts available for ${task.type}`)
        task.input = { concept: firstConcept } as TaskIO['timeline-generation']['input']
        break
      }

      default:
        break
    }
  }

  /**
   * Recursively marks all downstream tasks as skipped when an upstream fails.
   */
  private skipDependents(failedId: string): void {
    for (const task of Object.values(this.plan.tasks)) {
      if (task.dependencies.includes(failedId) && task.status === 'pending') {
        task.status = 'skipped'
        task.error = 'Skipped: upstream task failed'
        this.skipDependents(task.id)
      }
    }
  }

  private notify(): void {
    for (const fn of this.listeners) {
      try {
        fn(this.plan)
      } catch (err) {
        logger.error('Pipeline listener threw', { data: err })
      }
    }
  }

  private async persist(): Promise<void> {
    await this.store.save(this.plan)
  }
}
