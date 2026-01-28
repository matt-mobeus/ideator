// ============================================================================
// IDEATOR — Vision / OCR Client (NET-5.2)
// Image analysis and text extraction
// ============================================================================

/** Result of visual analysis */
export interface VisionResponse {
  /** Natural language description of the image */
  description: string;
  /** Detected text strings */
  detectedText?: string[];
  /** Detected objects */
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
  /** Full extracted text */
  text: string;
  /** Text blocks with positions */
  blocks: TextBlock[];
  /** Overall confidence (0-1) */
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
  constructor() {}

  async analyzeImage(_image: Blob, _prompt?: string): Promise<VisionResponse> {
    // TODO: Use Gemini multimodal API with image input
    throw new Error('GeminiVisionClient.analyzeImage not yet implemented');
  }

  async extractText(_image: Blob): Promise<OCRResult> {
    // TODO: Use Gemini with OCR-focused prompt
    throw new Error('GeminiVisionClient.extractText not yet implemented');
  }
}
