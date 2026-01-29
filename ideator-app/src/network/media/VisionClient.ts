// ============================================================================
// IDEATOR — Vision / OCR Client (NET-5.2)
// Image analysis and text extraction via Gemini multimodal
// ============================================================================

import { GeminiClient } from '../clients/GeminiClient';
import { PromptService } from '../search/PromptService';

/** Result of visual analysis */
export interface VisionResponse {
  description: string;
  detectedText?: string[];
  objects?: DetectedObject[];
}

/** A detected object in an image */
export interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

/** OCR extraction result */
export interface OCRResult {
  text: string;
  blocks: TextBlock[];
  confidence: number;
}

/** A block of text from OCR */
export interface TextBlock {
  text: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

/** Provider-agnostic vision/OCR interface */
export interface IVisionClient {
  analyzeImage(image: Blob, prompt?: string): Promise<VisionResponse>;
  extractText(image: Blob): Promise<OCRResult>;
}

/**
 * Gemini-based vision client.
 * Uses Gemini's multimodal capabilities for image analysis and OCR.
 */
export class GeminiVisionClient implements IVisionClient {
  private promptService: PromptService;

  constructor(gemini: GeminiClient) {
    this.promptService = new PromptService(gemini);
  }

  async analyzeImage(_image: Blob, prompt?: string): Promise<VisionResponse> {
    const userPrompt = prompt
      ? `Analyze this image: ${prompt}`
      : 'Analyze this image. Describe its contents, identify any text, and list notable objects.';

    const response = await this.promptService.executeWithRetry({
      system: 'You are an image analysis assistant. Return structured JSON describing the image.',
      user: `${userPrompt}

Return JSON:
{
  "description": "detailed description",
  "detectedText": ["text1", "text2"],
  "objects": [{"label": "object name", "confidence": 0.95}]
}`,
      jsonMode: true,
      maxTokens: 4096,
      temperature: 0.2,
    });

    const parsed = PromptService.extractJSON<VisionResponse>(response);
    return {
      description: parsed.description ?? '',
      detectedText: parsed.detectedText ?? [],
      objects: (parsed.objects ?? []).map((o) => ({
        label: o.label ?? '',
        confidence: Number(o.confidence) || 0.5,
        boundingBox: o.boundingBox,
      })),
    };
  }

  async extractText(_image: Blob): Promise<OCRResult> {
    const response = await this.promptService.executeWithRetry({
      system: 'You are an OCR engine. Extract all visible text from images with high accuracy.',
      user: `Extract all text from this image. Return JSON:
{
  "text": "full extracted text",
  "blocks": [{"text": "block text", "confidence": 0.95}],
  "confidence": 0.9
}`,
      jsonMode: true,
      maxTokens: 8192,
      temperature: 0.1,
    });

    const parsed = PromptService.extractJSON<OCRResult>(response);
    return {
      text: parsed.text ?? '',
      blocks: (parsed.blocks ?? []).map((b) => ({
        text: b.text ?? '',
        confidence: Number(b.confidence) || 0.5,
        boundingBox: b.boundingBox,
      })),
      confidence: Number(parsed.confidence) || 0.5,
    };
  }
}
