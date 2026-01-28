// ============================================================================
// IDEATOR — Extraction Processor (BE-3.2)
// Executes multi-pass concept extraction via LLM
// ============================================================================

import type { Concept } from '../../shared/types';
import type { FileRecord } from '../../shared/types';

/** Raw concept data before full Concept record creation */
export interface RawConcept {
  name: string;
  description: string;
  abstractionLevel: string;
  domain: string;
  themes: string[];
  sourceExcerpts: Array<{ text: string; location: string }>;
}

export class ExtractionProcessor {
  /**
   * Execute full 3-pass extraction on processed files.
   * Pass 1: Entity recognition
   * Pass 2: Abstraction mapping (L1/L2/L3)
   * Pass 3: Relationship mapping (parent/child/related)
   *
   * Returns fully formed Concept records with UUIDs.
   */
  async extract(files: FileRecord[]): Promise<Concept[]> {
    // TODO: For each file, chunk text via ExtractionPromptBuilder
    // TODO: Execute Pass 1 prompts via PromptService
    // TODO: Parse and validate responses
    // TODO: Execute Pass 2 for abstraction levels
    // TODO: Execute Pass 3 for relationships
    // TODO: Deduplicate concepts (fuzzy matching)
    // TODO: Create source references linking to original locations
    // TODO: Assign UUIDs and return Concept records
    throw new Error('ExtractionProcessor.extract not yet implemented');
  }
}
