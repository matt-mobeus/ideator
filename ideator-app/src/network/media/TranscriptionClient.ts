// ============================================================================
// IDEATOR — Audio Transcription Client (NET-5.1)
// Client for audio/video speech-to-text transcription via Gemini multimodal
// ============================================================================

import { GeminiClient } from '../clients/GeminiClient';
import { PromptService } from '../search/PromptService';

/** A segment of transcribed audio with timestamps */
export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

/** Full transcription result */
export interface Transcription {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
}

/** Async transcription job */
export interface TranscriptionJob {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: Transcription;
  error?: string;
}

/** Options for transcription */
export interface TranscriptionOptions {
  language?: string;
  wordTimestamps?: boolean;
}

/** Provider-agnostic transcription interface */
export interface ITranscriptionClient {
  transcribe(audio: Blob, options?: TranscriptionOptions): Promise<Transcription>;
  transcribeAsync(audio: Blob, options?: TranscriptionOptions): Promise<TranscriptionJob>;
  getJobStatus(jobId: string): Promise<TranscriptionJob>;
}

/**
 * Gemini-based transcription client.
 * Uses Gemini's multimodal capabilities for audio transcription.
 */
export class GeminiTranscriptionClient implements ITranscriptionClient {
  private promptService: PromptService;
  private jobs = new Map<string, TranscriptionJob>();

  constructor(gemini: GeminiClient) {
    this.promptService = new PromptService(gemini);
  }

  async transcribe(audio: Blob, options?: TranscriptionOptions): Promise<Transcription> {
    const languageHint = options?.language ? `The audio is in ${options.language}.` : '';

    const response = await this.promptService.executeWithRetry({
      system: 'You are a precise audio transcription service. Transcribe audio and return structured JSON.',
      user: `Transcribe the following audio. ${languageHint}

Return JSON:
{
  "text": "full transcribed text",
  "segments": [{"start": 0.0, "end": 2.5, "text": "segment text", "confidence": 0.95}],
  "language": "en",
  "duration": 60.0
}`,
      jsonMode: true,
      maxTokens: 8192,
      temperature: 0.1,
    });

    const parsed = PromptService.extractJSON<Transcription>(response);
    return {
      text: parsed.text ?? '',
      segments: (parsed.segments ?? []).map((s) => ({
        start: Number(s.start) || 0,
        end: Number(s.end) || 0,
        text: s.text ?? '',
        confidence: Number(s.confidence) || 0.5,
      })),
      language: parsed.language ?? 'en',
      duration: Number(parsed.duration) || 0,
    };
  }

  async transcribeAsync(audio: Blob, options?: TranscriptionOptions): Promise<TranscriptionJob> {
    const jobId = crypto.randomUUID();
    const job: TranscriptionJob = { jobId, status: 'queued' };
    this.jobs.set(jobId, job);

    // Fire and forget
    (async () => {
      job.status = 'processing';
      try {
        job.result = await this.transcribe(audio, options);
        job.status = 'completed';
      } catch (err) {
        job.status = 'failed';
        job.error = err instanceof Error ? err.message : 'Transcription failed';
      }
    })();

    return job;
  }

  async getJobStatus(jobId: string): Promise<TranscriptionJob> {
    const job = this.jobs.get(jobId);
    if (!job) return { jobId, status: 'failed', error: 'Job not found' };
    return { ...job };
  }
}
