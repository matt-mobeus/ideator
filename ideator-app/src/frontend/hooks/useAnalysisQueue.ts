// ============================================================================
// IDEATOR — Analysis Queue Hook
// Wraps JobQueue + JobProcessor for React components
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import type { QueueJob } from '../../shared/types';
import { JobStatus } from '../../shared/types';
import { StorageService } from '../../backend/storage/StorageService';

interface UseAnalysisQueueResult {
  jobs: QueueJob[];
  activeJob: QueueJob | null;
  enqueue: (conceptId: string) => Promise<void>;
  cancel: (jobId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAnalysisQueue(storage?: StorageService): UseAnalysisQueueResult {
  const svc = useRef(storage ?? new StorageService());
  const [jobs, setJobs] = useState<QueueJob[]>([]);

  const refresh = useCallback(async () => {
    const all = await svc.current.getQueueJobs();
    setJobs(all);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enqueue = useCallback(async (conceptId: string) => {
    const job: QueueJob = {
      id: crypto.randomUUID(),
      conceptId,
      status: JobStatus.QUEUED,
      phase: null,
      progress: 0,
      queuedAt: new Date(),
      startedAt: null,
      completedAt: null,
      error: null,
    };
    await svc.current.saveQueueJob(job);
    await refresh();
  }, [refresh]);

  const cancel = useCallback(async (jobId: string) => {
    await svc.current.deleteQueueJob(jobId);
    await refresh();
  }, [refresh]);

  const activeJob = jobs.find((j) => j.status === JobStatus.PROCESSING) ?? null;

  return { jobs, activeJob, enqueue, cancel, refresh };
}
