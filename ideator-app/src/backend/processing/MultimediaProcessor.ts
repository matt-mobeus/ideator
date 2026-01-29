// ============================================================================
// IDEATOR — Multimedia Processor (BE-2.3)
// Processes video, audio, presentations, and images
// ============================================================================

import type { ExtractedText, TextSection } from './TextDocumentProcessor';
import type { ITranscriptionClient } from '../../network/media/TranscriptionClient';
import type { IVisionClient } from '../../network/media/VisionClient';
import { VideoFrameService } from '../../network/media/VideoFrameService';

export class MultimediaProcessor {
  private transcriptionClient?: ITranscriptionClient;
  private visionClient?: IVisionClient;
  private videoFrameService = new VideoFrameService();

  constructor(transcriptionClient?: ITranscriptionClient, visionClient?: IVisionClient) {
    this.transcriptionClient = transcriptionClient;
    this.visionClient = visionClient;
  }

  /** Process a multimedia file into text */
  async process(file: File): Promise<ExtractedText> {
    const extension = this.getExtension(file.name);

    if (this.isVideo(extension)) return this.processVideo(file);
    if (this.isAudio(extension)) return this.processAudio(file);
    if (this.isPresentation(extension)) return this.processPresentation(file);
    if (this.isImage(extension)) return this.processImage(file);

    return { text: '', sections: [], totalPages: 0 };
  }

  private async processVideo(file: File): Promise<ExtractedText> {
    const sections: TextSection[] = [];
    const textParts: string[] = [];

    // Extract audio transcription
    if (this.transcriptionClient) {
      try {
        const transcription = await this.transcriptionClient.transcribe(file);
        for (const segment of transcription.segments) {
          const ts = this.formatTimestamp(segment.start);
          sections.push({
            text: segment.text,
            location: `Timestamp ${ts}`,
          });
        }
        textParts.push(transcription.text);
      } catch {
        // Transcription failed, continue with frame analysis
      }
    }

    // Extract key frames and OCR them
    if (this.visionClient) {
      try {
        const keyFrames = await this.videoFrameService.extractKeyFrames(file);
        for (const frame of keyFrames.slice(0, 20)) {
          const ts = this.formatTimestamp(frame.timestamp);
          const ocrResult = await this.visionClient.extractText(frame.blob);
          if (ocrResult.text.trim()) {
            sections.push({
              text: ocrResult.text,
              location: `Frame at ${ts}`,
              heading: `On-screen text at ${ts}`,
            });
            textParts.push(ocrResult.text);
          }
        }
      } catch {
        // Frame extraction/OCR failed
      }
    }

    const text = textParts.join('\n\n');
    return { text, sections, totalPages: sections.length || 1 };
  }

  private async processAudio(file: File): Promise<ExtractedText> {
    if (!this.transcriptionClient) {
      return {
        text: '[Audio transcription requires a transcription API key]',
        sections: [],
        totalPages: 0,
      };
    }

    const transcription = await this.transcriptionClient.transcribe(file);
    const sections: TextSection[] = transcription.segments.map((seg) => ({
      text: seg.text,
      location: `Timestamp ${this.formatTimestamp(seg.start)}`,
    }));

    return {
      text: transcription.text,
      sections,
      totalPages: sections.length || 1,
    };
  }

  private async processPresentation(file: File): Promise<ExtractedText> {
    // PPTX is a ZIP containing ppt/slides/slide*.xml
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder();
    const raw = decoder.decode(new Uint8Array(buffer));

    const sections: TextSection[] = [];
    const textParts: string[] = [];

    // Extract text from <a:t> tags (PowerPoint XML)
    const slideTexts = new Map<number, string[]>();
    const slideRegex = /slide(\d+)\.xml/g;
    let slideMatch: RegExpExecArray | null;
    let slideNumbers: number[] = [];

    while ((slideMatch = slideRegex.exec(raw)) !== null) {
      slideNumbers.push(parseInt(slideMatch[1]));
    }
    slideNumbers = [...new Set(slideNumbers)].sort((a, b) => a - b);

    // Extract all text content from presentation XML
    const textRegex = /<a:t>([^<]*)<\/a:t>/g;
    let textMatch: RegExpExecArray | null;
    const allTexts: string[] = [];
    while ((textMatch = textRegex.exec(raw)) !== null) {
      allTexts.push(textMatch[1]);
    }

    if (slideNumbers.length > 0) {
      // Distribute text across slides (rough approximation)
      const perSlide = Math.ceil(allTexts.length / slideNumbers.length);
      slideNumbers.forEach((num, i) => {
        const slideText = allTexts.slice(i * perSlide, (i + 1) * perSlide).join(' ');
        if (slideText.trim()) {
          sections.push({
            text: slideText,
            location: `Slide ${num}`,
          });
          textParts.push(slideText);
        }
      });
    } else if (allTexts.length > 0) {
      const joined = allTexts.join(' ');
      sections.push({ text: joined, location: 'Slide 1' });
      textParts.push(joined);
    }

    // Also extract speaker notes from <p:notes> if present
    const notesRegex = /<p:notes[\s\S]*?<a:t>([^<]*)<\/a:t>[\s\S]*?<\/p:notes>/g;
    let notesMatch: RegExpExecArray | null;
    while ((notesMatch = notesRegex.exec(raw)) !== null) {
      sections.push({
        text: notesMatch[1],
        location: 'Speaker Notes',
        heading: 'Speaker Notes',
      });
      textParts.push(notesMatch[1]);
    }

    const text = textParts.join('\n\n');
    return {
      text: text || '[Presentation extraction may need a specialized library for full fidelity]',
      sections,
      totalPages: slideNumbers.length || 1,
    };
  }

  private async processImage(file: File): Promise<ExtractedText> {
    if (!this.visionClient) {
      return {
        text: '[Image analysis requires a vision API key]',
        sections: [],
        totalPages: 1,
      };
    }

    const [ocrResult, visionResult] = await Promise.all([
      this.visionClient.extractText(file),
      this.visionClient.analyzeImage(file, 'Describe this image in detail, including any text, diagrams, charts, or data visible.'),
    ]);

    const sections: TextSection[] = [];
    const textParts: string[] = [];

    if (ocrResult.text.trim()) {
      sections.push({
        text: ocrResult.text,
        location: 'OCR Text',
        heading: 'Extracted Text',
      });
      textParts.push(ocrResult.text);
    }

    if (visionResult.description) {
      sections.push({
        text: visionResult.description,
        location: 'Visual Analysis',
        heading: 'Image Description',
      });
      textParts.push(visionResult.description);
    }

    return {
      text: textParts.join('\n\n'),
      sections,
      totalPages: 1,
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.slice(lastDot).toLowerCase();
  }

  private isVideo(ext: string): boolean {
    return ['.mp4', '.mov', '.webm', '.avi'].includes(ext);
  }

  private isAudio(ext: string): boolean {
    return ['.mp3', '.wav', '.m4a', '.ogg'].includes(ext);
  }

  private isPresentation(ext: string): boolean {
    return ['.pptx', '.ppt', '.key'].includes(ext);
  }

  private isImage(ext: string): boolean {
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.tiff'].includes(ext);
  }

  private formatTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
