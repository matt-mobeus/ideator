// ============================================================================
// IDEATOR — Extraction Prompt Builder (BE-3.1)
// Builds LLM prompts for concept extraction from text corpus
// ============================================================================

import type { Prompt } from '../../network/search/PromptService';

/** A chunk of text with context for extraction */
export interface TextChunk {
  /** The text content */
  text: string;
  /** Source file name */
  fileName: string;
  /** Location within the source (page, section, etc.) */
  location: string;
  /** Chunk index (for multi-chunk documents) */
  chunkIndex: number;
  /** Total chunks for this document */
  totalChunks: number;
}

export class ExtractionPromptBuilder {
  /**
   * Chunk a document's text corpus for LLM processing.
   * Uses overlap to preserve concept continuity across chunks.
   */
  chunkText(text: string, fileName: string, maxChunkSize?: number): TextChunk[] {
    // TODO: Split text into chunks with configurable overlap
    // TODO: Respect sentence boundaries
    // TODO: Track location metadata
    throw new Error('ExtractionPromptBuilder.chunkText not yet implemented');
  }

  /**
   * Build the extraction prompt for Pass 1: Entity Recognition.
   * Identifies technologies, methods, principles from text.
   */
  buildPass1Prompt(chunk: TextChunk): Prompt {
    // TODO: System prompt for concept extraction
    // TODO: User prompt with chunk text
    // TODO: JSON output schema
    throw new Error('ExtractionPromptBuilder.buildPass1Prompt not yet implemented');
  }

  /**
   * Build the prompt for Pass 2: Abstraction Level Assignment.
   * Assigns L1/L2/L3 and identifies parent/child relationships.
   */
  buildPass2Prompt(rawConcepts: unknown[]): Prompt {
    // TODO: System prompt for abstraction mapping
    // TODO: Include raw concepts from Pass 1
    throw new Error('ExtractionPromptBuilder.buildPass2Prompt not yet implemented');
  }

  /**
   * Build the prompt for Pass 3: Clustering.
   * Groups concepts by theme/domain, detects cross-domain connections.
   */
  buildPass3Prompt(conceptsWithLevels: unknown[]): Prompt {
    // TODO: System prompt for clustering
    // TODO: Include concepts with abstraction levels
    throw new Error('ExtractionPromptBuilder.buildPass3Prompt not yet implemented');
  }
}
