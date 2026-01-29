// ============================================================================
// IDEATOR — Processing Hook
// Wraps ProcessingOrchestrator for React components
// ============================================================================

import { useState, useCallback } from 'react';
import { ProcessingOrchestrator, type ProcessingProgress } from '../../backend/processing/ProcessingOrchestrator';
import { StorageService } from '../../backend/storage/StorageService';
import type { FileRecord } from '../../shared/types';

interface UseProcessingResult {
  processing: boolean;
  progress: ProcessingProgress | null;
  results: FileRecord[];
  error: string | null;
  processFiles: (files: File[]) => Promise<FileRecord[]>;
}

export function useProcessing(storage?: StorageService): UseProcessingResult {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [results, setResults] = useState<FileRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(async (files: File[]): Promise<FileRecord[]> => {
    const svc = storage ?? new StorageService();
    const orchestrator = new ProcessingOrchestrator(svc);

    setProcessing(true);
    setError(null);
    setResults([]);

    try {
      const records = await orchestrator.processBatch(files, (p) => setProgress(p));
      setResults(records);
      return records;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Processing failed';
      setError(msg);
      return [];
    } finally {
      setProcessing(false);
    }
  }, [storage]);

  return { processing, progress, results, error, processFiles };
}
