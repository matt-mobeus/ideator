// ============================================================================
// IDEATOR — Offline Request Queue (NET-7.1)
// Persists network requests for execution when connectivity returns
// ============================================================================

import { db } from '../../backend/storage/database';

/** A queued network request */
export interface QueuedRequest {
  id: string;
  type: 'file_upload' | 'analysis' | 'asset_generation';
  payload: unknown;
  createdAt: Date;
  attempts: number;
  lastError?: string;
}

export class RequestQueue {
  /** Add a request to the queue (deduplicates by id) */
  async enqueue(request: QueuedRequest): Promise<void> {
    const existing = await db.offlineQueue.get(request.id);
    if (existing) return;
    await db.offlineQueue.put(request);
  }

  /** Remove and return the next request (FIFO by createdAt) */
  async dequeue(): Promise<QueuedRequest | null> {
    const item = await db.offlineQueue.orderBy('createdAt').first();
    if (!item) return null;
    await db.offlineQueue.delete(item.id);
    return item;
  }

  /** Peek at the next request without removing */
  async peek(): Promise<QueuedRequest | null> {
    const item = await db.offlineQueue.orderBy('createdAt').first();
    return item ?? null;
  }

  /** Remove a specific request */
  async remove(id: string): Promise<void> {
    await db.offlineQueue.delete(id);
  }

  /** Get all queued requests ordered by creation time */
  async getAll(): Promise<QueuedRequest[]> {
    return db.offlineQueue.orderBy('createdAt').toArray();
  }

  /** Get queue size */
  async size(): Promise<number> {
    return db.offlineQueue.count();
  }

  /** Clear the entire queue */
  async clear(): Promise<void> {
    await db.offlineQueue.clear();
  }

  /** Update a request (e.g. increment attempts, set lastError) */
  async update(id: string, changes: Partial<QueuedRequest>): Promise<void> {
    await db.offlineQueue.update(id, changes);
  }
}