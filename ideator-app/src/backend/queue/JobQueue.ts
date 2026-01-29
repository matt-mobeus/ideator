// ============================================================================
// IDEATOR — Job Queue Implementation (BE-7.1)
// Persistent FIFO queue for analysis jobs
// ============================================================================

import type { QueueJob } from '../../shared/types';
import { JobStatus } from '../../shared/types';
import { StorageService } from '../storage/StorageService';
import { generateId } from '../../shared/utils';

export type QueueEvent =
  | { type: 'job_added'; job: QueueJob }
  | { type: 'job_started'; job: QueueJob }
  | { type: 'job_completed'; job: QueueJob }
  | { type: 'job_failed'; job: QueueJob; error: string }
  | { type: 'job_cancelled'; jobId: string };

export type QueueEventCallback = (event: QueueEvent) => void;

export class JobQueue {
  private listeners: QueueEventCallback[] = [];
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  async add(conceptId: string, conceptName: string): Promise<QueueJob> {
    const job: QueueJob = {
      id: generateId(),
      conceptId,
      conceptName,
      status: JobStatus.QUEUED,
      progress: 0,
      queuedAt: new Date(),
    };
    await this.storage.saveQueueJob(job);
    this.emit({ type: 'job_added', job });
    return job;
  }

  async cancel(jobId: string): Promise<boolean> {
    const jobs = await this.storage.getQueueJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status !== JobStatus.QUEUED) return false;
    await this.storage.deleteQueueJob(jobId);
    this.emit({ type: 'job_cancelled', jobId });
    return true;
  }

  async getAll(): Promise<QueueJob[]> {
    return this.storage.getQueueJobs();
  }

  async getNext(): Promise<QueueJob | undefined> {
    const jobs = await this.storage.getQueueJobs();
    return jobs.find((j) => j.status === JobStatus.QUEUED);
  }

  async updateJob(jobId: string, updates: Partial<QueueJob>): Promise<void> {
    const jobs = await this.storage.getQueueJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const updated = { ...job, ...updates };
    await this.storage.saveQueueJob(updated);

    if (updates.status === JobStatus.PROCESSING) {
      this.emit({ type: 'job_started', job: updated });
    } else if (updates.status === JobStatus.COMPLETED) {
      this.emit({ type: 'job_completed', job: updated });
    } else if (updates.status === JobStatus.FAILED) {
      this.emit({ type: 'job_failed', job: updated, error: updates.errorMessage ?? 'Unknown error' });
    }
  }

  onEvent(callback: QueueEventCallback): void {
    this.listeners.push(callback);
  }

  async isConceptQueued(conceptId: string): Promise<boolean> {
    const jobs = await this.storage.getQueueJobs();
    return jobs.some(
      (j) => j.conceptId === conceptId &&
        (j.status === JobStatus.QUEUED || j.status === JobStatus.PROCESSING)
    );
  }

  private emit(event: QueueEvent): void {
    for (const cb of this.listeners) {
      try { cb(event); } catch { /* ignore */ }
    }
  }
}
