import { dequeue, updateProgress, complete, fail } from './job-queue.service.ts'
import { analyzeAndStore } from './market-analysis.service.ts'
import { storage } from './storage.service.ts'
import type { Job } from '@/types/queue.ts'
import type { Concept } from '@/types/concept.ts'
import type { LlmProvider } from '@/network/llm/types.ts'

/**
 * Process a single job from the queue
 */
async function processJob(job: Job, provider: LlmProvider): Promise<void> {
  try {
    await updateProgress(job.id, 10, 'Starting analysis...')

    switch (job.type) {
      case 'market_analysis': {
        // Fetch the concept
        const concept = await storage.getById('concepts', job.targetId) as Concept | undefined
        if (!concept) {
          throw new Error(`Concept not found: ${job.targetId}`)
        }

        await updateProgress(job.id, 50, 'Analyzing...')

        // Run market analysis
        await analyzeAndStore(concept, provider)

        await complete(job.id)
        break
      }

      case 'file_processing':
      case 'concept_extraction':
      case 'asset_generation':
      case 'visualization':
        throw new Error(`Job type not yet implemented: ${job.type}`)

      default:
        throw new Error(`Unknown job type: ${(job as Job).type}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    await fail(job.id, errorMessage)
  }
}

/**
 * Process the next pending job in the queue
 * @returns true if a job was processed, false if queue was empty
 */
export async function processNext(provider: LlmProvider): Promise<boolean> {
  const job = await dequeue()
  if (!job) {
    return false
  }

  await processJob(job, provider)
  return true
}

/**
 * Process all pending jobs sequentially
 * @returns number of jobs processed
 */
export async function processAll(provider: LlmProvider): Promise<number> {
  let count = 0

  while (true) {
    try {
      const processed = await processNext(provider)
      if (!processed) {
        break
      }
      count++
    } catch {
      count++
    }
  }

  return count
}

/**
 * Start a processing loop that runs at a regular interval
 * @param intervalMs Interval between checks in milliseconds (default: 2000)
 * @returns Function to stop the processing loop
 */
export function startProcessingLoop(
  provider: LlmProvider,
  intervalMs: number = 2000
): () => void {
  let stopped = false

  async function tick() {
    if (stopped) return
    try {
      await processNext(provider)
    } catch {
      /* already handled */
    }
    if (!stopped) {
      setTimeout(tick, intervalMs)
    }
  }

  tick()

  return () => {
    stopped = true
  }
}
