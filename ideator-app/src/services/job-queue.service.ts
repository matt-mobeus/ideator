import { storage } from './storage.service.ts'
import { db } from '@/db/database.ts'
import type { Job, JobType, JobStatus } from '@/types/queue.ts'

export async function enqueue(type: JobType, targetId: string): Promise<Job> {
  const job: Job = {
    id: crypto.randomUUID(),
    type,
    status: 'pending',
    targetId,
    progress: 0,
    createdAt: new Date(),
  }
  await storage.put('queue', job)
  return job
}

export async function dequeue(): Promise<Job | null> {
  return db.transaction('rw', db.queue, async () => {
    const pending = await db.queue
      .where('status')
      .equals('pending')
      .sortBy('createdAt')

    if (pending.length === 0) {
      return null
    }

    const job = pending[0]
    const updated: Job = {
      ...job,
      status: 'running',
      startedAt: new Date(),
    }
    await db.queue.put(updated)
    return updated
  })
}

export async function updateProgress(
  id: string,
  progress: number,
  label?: string
): Promise<void> {
  const job = await storage.getById<Job>('queue', id)
  if (!job) {
    throw new Error(`Job ${id} not found`)
  }

  const updated: Job = {
    ...job,
    progress,
    ...(label !== undefined && { progressLabel: label }),
  }
  await storage.put('queue', updated)
}

export async function complete(id: string): Promise<void> {
  const job = await storage.getById<Job>('queue', id)
  if (!job) {
    throw new Error(`Job ${id} not found`)
  }

  const updated: Job = {
    ...job,
    status: 'completed',
    progress: 100,
    completedAt: new Date(),
  }
  await storage.put('queue', updated)
}

export async function fail(id: string, error: string): Promise<void> {
  const job = await storage.getById<Job>('queue', id)
  if (!job) {
    throw new Error(`Job ${id} not found`)
  }

  const updated: Job = {
    ...job,
    status: 'failed',
    errorMessage: error,
    completedAt: new Date(),
  }
  await storage.put('queue', updated)
}

export async function cancel(id: string): Promise<void> {
  const job = await storage.getById<Job>('queue', id)
  if (!job) {
    throw new Error(`Job ${id} not found`)
  }

  const updated: Job = {
    ...job,
    status: 'cancelled',
    completedAt: new Date(),
  }
  await storage.put('queue', updated)
}

export async function getByStatus(status: JobStatus): Promise<Job[]> {
  return await storage.where<Job>('queue', 'status', status)
}

export async function getByTargetId(targetId: string): Promise<Job[]> {
  return await storage.where<Job>('queue', 'targetId', targetId)
}

export async function getPending(): Promise<Job[]> {
  return await getByStatus('pending')
}

export async function getRunning(): Promise<Job[]> {
  return await getByStatus('running')
}

export async function clearCompleted(): Promise<void> {
  const completed = await getByStatus('completed')
  await Promise.all(completed.map(job => storage.delete('queue', job.id)))
}
