// ============================================================================
// IDEATOR — Job Queue Implementation (BE-7.1)
// Persistent FIFO queue for analysis jobs
// ============================================================================

import type { QueueJob } from '../../shared/types';
import { JobStatus } from '../../shared/types';

/** Events emitted by the job queue */
export type QueueEvent =
  | { type: 'job_added'; job: QueueJob }
  | { type: 'job_started'; job: QueueJob }
  | { type: 'job_completed'; job: QueueJob }
  | { type: 'job_failed'; job: QueueJob; error: string }
  | { type: 'job_cancelled'; jobId: string };

export type QueueEventCallback = (event: QueueEvent) => void;

export class JobQueue {
  private listeners: QueueEventCallback[] = [];

  /** Add a concept to the analysis queue */
  async add(conceptId: string, conceptName: string): Promise<QueueJob> {
    // TODO: Create QueueJob record with QUEUED status
    // TODO: Persist to StorageService
    // TODO: Emit job_added event
    // TODO: Trigger processing if queue was empty
    throw new Error('JobQueue.add not yet implemented');
  }

  /** Cancel a queued (not processing) job */
  async cancel(jobId: string): Promise<boolean> {
    // TODO: Only cancel if status is QUEUED (not PROCESSING)
    // TODO: Remove from StorageService
    // TODO: Emit job_cancelled event
    throw new Error('JobQueue.cancel not yet implemented');
  }

  /** Get all jobs in the queue */
  async getAll(): Promise<QueueJob[]> {
    // TODO: Fetch from StorageService, ordered by queuedAt
    throw new Error('JobQueue.getAll not yet implemented');
  }

  /** Get the next queued job */
  async getNext(): Promise<QueueJob | undefined> {
    // TODO: Return first job with QUEUED status
    throw new Error('JobQueue.getNext not yet implemented');
  }

  /** Update a job's status and progress */
  async updateJob(jobId: string, updates: Partial<QueueJob>): Promise<void> {
    // TODO: Update in StorageService
    // TODO: Emit appropriate event
    throw new Error('JobQueue.updateJob not yet implemented');
  }

  /** Register event listener */
  onEvent(callback: QueueEventCallback): void {
    this.listeners.push(callback);
  }

  /** Check if a concept is already queued or analyzed */
  async isConceptQueued(conceptId: string): Promise<boolean> {
    // TODO: Check queue for existing job with this conceptId
    throw new Error('JobQueue.isConceptQueued not yet implemented');
  }
}
