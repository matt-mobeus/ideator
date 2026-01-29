// ============================================================================
// IDEATOR — Job Processor (BE-7.2)
// Processes queued analysis jobs with phase tracking
// ============================================================================

import { AnalysisPhase, JobStatus } from '../../shared/types';
import { JobQueue } from './JobQueue';
import { AnalysisProcessor } from '../analysis/AnalysisProcessor';
import { StorageService } from '../storage/StorageService';

export const PHASE_LABELS: Record<AnalysisPhase, string> = {
  [AnalysisPhase.SEARCHING_TRENDS]: 'Searching market trends...',
  [AnalysisPhase.ANALYZING_FEASIBILITY]: 'Analyzing technical feasibility...',
  [AnalysisPhase.EVALUATING_INVESTMENT]: 'Evaluating investment potential...',
  [AnalysisPhase.GENERATING_VISUALIZATIONS]: 'Generating visualizations...',
  [AnalysisPhase.COMPILING_REPORT]: 'Compiling report...',
};

const PHASE_PROGRESS: Record<AnalysisPhase, number> = {
  [AnalysisPhase.SEARCHING_TRENDS]: 20,
  [AnalysisPhase.ANALYZING_FEASIBILITY]: 40,
  [AnalysisPhase.EVALUATING_INVESTMENT]: 60,
  [AnalysisPhase.GENERATING_VISUALIZATIONS]: 80,
  [AnalysisPhase.COMPILING_REPORT]: 95,
};

export class JobProcessor {
  private running = false;
  private queue: JobQueue;
  private analysisProcessor: AnalysisProcessor;
  private storage: StorageService;

  constructor(queue: JobQueue, analysisProcessor: AnalysisProcessor, storage: StorageService) {
    this.queue = queue;
    this.analysisProcessor = analysisProcessor;
    this.storage = storage;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    while (this.running) {
      const job = await this.queue.getNext();
      if (!job) { this.running = false; break; }

      await this.queue.updateJob(job.id, {
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
        currentPhase: AnalysisPhase.SEARCHING_TRENDS,
        progress: 0,
      });

      try {
        const concept = await this.storage.getConcept(job.conceptId);
        if (!concept) throw new Error(`Concept ${job.conceptId} not found`);

        const result = await this.analysisProcessor.analyze(
          concept,
          async (phase: string, progress: number) => {
            const ap = phase as AnalysisPhase;
            await this.queue.updateJob(job.id, {
              currentPhase: ap,
              progress: PHASE_PROGRESS[ap] ?? progress,
            });
          }
        );

        await this.storage.saveAnalysis(result);
        await this.queue.updateJob(job.id, {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          progress: 100,
        });
      } catch (err) {
        await this.queue.updateJob(job.id, {
          status: JobStatus.FAILED,
          completedAt: new Date(),
          errorMessage: err instanceof Error ? err.message : 'Analysis failed',
        });
      }
    }
  }

  stop(): void { this.running = false; }
  isRunning(): boolean { return this.running; }
}
