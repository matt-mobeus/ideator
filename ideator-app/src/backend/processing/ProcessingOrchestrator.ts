// ============================================================================
// IDEATOR — Processing Orchestrator (BE-2.5)
// Coordinates file processing pipeline, runs in Web Worker
// ============================================================================

import type { FileRecord } from '../../shared/types';

/** Progress event emitted during processing */
export interface ProcessingProgress {
  /** Total files to process */
  totalFiles: number;
  /** Current file index (0-based) */
  currentFileIndex: number;
  /** Current file name */
  currentFileName: string;
  /** Current phase description */
  phase: string;
  /** Overall progress percentage (0-100) */
  overallProgress: number;
  /** Per-file progress percentage (0-100) */
  fileProgress: number;
  /** Files that failed processing */
  failedFiles: Array<{ name: string; error: string }>;
  /** Whether all processing is complete */
  done: boolean;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

export class ProcessingOrchestrator {
  /**
   * Process a batch of files through the pipeline.
   * Routes each file to the correct processor based on format.
   * Emits progress events.
   * Returns unified text corpus per file.
   */
  async processBatch(
    files: File[],
    onProgress?: ProgressCallback
  ): Promise<FileRecord[]> {
    // TODO: Set up Web Worker for non-blocking processing
    // TODO: Detect format for each file (FileFormatDetector)
    // TODO: Route to TextDocumentProcessor, MultimediaProcessor, or StructuredDataProcessor
    // TODO: Build unified text corpus
    // TODO: Save FileRecords to StorageService
    // TODO: Emit progress events
    // TODO: Aggregate errors, allow partial success
    throw new Error('ProcessingOrchestrator.processBatch not yet implemented');
  }
}
