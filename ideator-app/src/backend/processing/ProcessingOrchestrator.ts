// ============================================================================
// IDEATOR — Processing Orchestrator (BE-2.5)
// Coordinates file processing pipeline
// ============================================================================

import type { FileRecord } from '../../shared/types';
import { FileFormatCategory } from '../../shared/types';
import { FileFormatDetector } from './FileFormatDetector';
import { TextDocumentProcessor } from './TextDocumentProcessor';
import { MultimediaProcessor } from './MultimediaProcessor';
import { StructuredDataProcessor } from './StructuredDataProcessor';
import { StorageService } from '../storage/StorageService';

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
  private formatDetector = new FileFormatDetector();
  private textProcessor = new TextDocumentProcessor();
  private multimediaProcessor: MultimediaProcessor;
  private structuredProcessor = new StructuredDataProcessor();
  private storage: StorageService;

  constructor(storage: StorageService, multimediaProcessor?: MultimediaProcessor) {
    this.storage = storage;
    this.multimediaProcessor = multimediaProcessor ?? new MultimediaProcessor();
  }

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
    const totalFiles = files.length;
    const results: FileRecord[] = [];
    const failedFiles: Array<{ name: string; error: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress: ProcessingProgress = {
        totalFiles,
        currentFileIndex: i,
        currentFileName: file.name,
        phase: 'Detecting format...',
        overallProgress: Math.round((i / totalFiles) * 100),
        fileProgress: 0,
        failedFiles: [...failedFiles],
        done: false,
      };
      onProgress?.(progress);

      try {
        // Detect format
        const formatInfo = await this.formatDetector.detectFromBytes(file);

        if (!formatInfo.supported) {
          failedFiles.push({ name: file.name, error: `Unsupported format: ${formatInfo.formatName}` });
          continue;
        }

        // Update progress
        onProgress?.({
          ...progress,
          phase: 'Extracting text...',
          fileProgress: 30,
        });

        // Route to correct processor
        let textCorpus = '';
        switch (formatInfo.category) {
          case FileFormatCategory.TEXT:
            textCorpus = (await this.textProcessor.process(file)).text;
            break;
          case FileFormatCategory.MULTIMEDIA:
            textCorpus = (await this.multimediaProcessor.process(file)).text;
            break;
          case FileFormatCategory.STRUCTURED:
            textCorpus = (await this.structuredProcessor.process(file)).text;
            break;
        }

        onProgress?.({
          ...progress,
          phase: 'Saving...',
          fileProgress: 80,
        });

        // Create and save FileRecord
        const record: FileRecord = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          mimeType: formatInfo.mimeType,
          formatCategory: formatInfo.category,
          extension: formatInfo.extension,
          blob: file,
          uploadedAt: new Date(),
          processed: true,
          textCorpus,
        };

        await this.storage.saveFile(record);
        results.push(record);

        onProgress?.({
          ...progress,
          phase: 'Done',
          fileProgress: 100,
          overallProgress: Math.round(((i + 1) / totalFiles) * 100),
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Processing failed';
        failedFiles.push({ name: file.name, error: errorMsg });
      }
    }

    // Final progress
    onProgress?.({
      totalFiles,
      currentFileIndex: totalFiles - 1,
      currentFileName: '',
      phase: 'Complete',
      overallProgress: 100,
      fileProgress: 100,
      failedFiles,
      done: true,
    });

    return results;
  }
}
