// ============================================================================
// IDEATOR — Sync Manager (NET-7.2)
// Manages synchronization when connectivity is restored
// ============================================================================

import { RequestQueue, type QueuedRequest } from './RequestQueue';

/** Sync status snapshot */
export interface SyncStatus {
  /** Whether sync is currently running */
  syncing: boolean;
  /** Number of items remaining */
  remaining: number;
  /** Number of items processed in current sync */
  processed: number;
  /** Number of failures in current sync */
  failures: number;
  /** Whether the device is online */
  online: boolean;
}

type SyncProgressCallback = (status: SyncStatus) => void;
type SyncCompleteCallback = () => void;
type SyncErrorCallback = (error: Error) => void;

/** Handler that executes a queued request. Returns true on success. */
export type RequestExecutor = (request: QueuedRequest) => Promise<boolean>;

const MAX_ATTEMPTS = 3;

export class SyncManager {
  private _status: SyncStatus = {
    syncing: false,
    remaining: 0,
    processed: 0,
    failures: 0,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };

  private queue: RequestQueue;
  private executor: RequestExecutor;
  private aborted = false;
  private progressListeners: SyncProgressCallback[] = [];
  private completeListeners: SyncCompleteCallback[] = [];
  private errorListeners: SyncErrorCallback[] = [];
  private boundOnline: () => void;
  private boundOffline: () => void;

  constructor(queue: RequestQueue, executor: RequestExecutor) {
    this.queue = queue;
    this.executor = executor;

    this.boundOnline = () => {
      this._status.online = true;
      this.startSync();
    };
    this.boundOffline = () => {
      this._status.online = false;
      this.stopSync();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.boundOnline);
      window.addEventListener('offline', this.boundOffline);
    }
  }

  /** Start processing the offline queue */
  async startSync(): Promise<void> {
    if (this._status.syncing || !this._status.online) return;

    this._status.syncing = true;
    this._status.processed = 0;
    this._status.failures = 0;
    this.aborted = false;

    try {
      const remaining = await this.queue.size();
      this._status.remaining = remaining;
      this.emitProgress();

      while (!this.aborted) {
        const request = await this.queue.peek();
        if (!request) break;

        try {
          const success = await this.executor(request);
          if (success) {
            await this.queue.remove(request.id);
            this._status.processed++;
          } else {
            await this.handleFailure(request, new Error('Executor returned false'));
          }
        } catch (err) {
          await this.handleFailure(request, err instanceof Error ? err : new Error(String(err)));
        }

        this._status.remaining = await this.queue.size();
        this.emitProgress();
      }

      this._status.syncing = false;
      this.emitProgress();
      if (!this.aborted) {
        for (const cb of this.completeListeners) cb();
      }
    } catch (err) {
      this._status.syncing = false;
      const error = err instanceof Error ? err : new Error(String(err));
      for (const cb of this.errorListeners) cb(error);
    }
  }

  /** Stop sync processing */
  stopSync(): void {
    this.aborted = true;
    this._status.syncing = false;
  }

  /** Get current sync status */
  getSyncStatus(): SyncStatus {
    return { ...this._status };
  }

  /** Register callback for sync progress */
  onSyncProgress(callback: SyncProgressCallback): void {
    this.progressListeners.push(callback);
  }

  /** Register callback for sync completion */
  onSyncComplete(callback: SyncCompleteCallback): void {
    this.completeListeners.push(callback);
  }

  /** Register callback for sync errors */
  onSyncError(callback: SyncErrorCallback): void {
    this.errorListeners.push(callback);
  }

  /** Clean up event listeners */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.boundOnline);
      window.removeEventListener('offline', this.boundOffline);
    }
    this.progressListeners = [];
    this.completeListeners = [];
    this.errorListeners = [];
  }

  private async handleFailure(request: QueuedRequest, error: Error): Promise<void> {
    const attempts = request.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await this.queue.remove(request.id);
      this._status.failures++;
      for (const cb of this.errorListeners) cb(error);
    } else {
      await this.queue.update(request.id, {
        attempts,
        lastError: error.message,
      });
    }
  }

  private emitProgress(): void {
    const status = this.getSyncStatus();
    for (const cb of this.progressListeners) cb(status);
  }
}