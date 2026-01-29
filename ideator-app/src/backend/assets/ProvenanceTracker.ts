// ================================================================
// IDEATOR — Provenance Tracker (BE-6.3)
// Tracks source-to-claim provenance chains for generated assets
// ================================================================

import type { ProvenanceChain, Claim, SourceRef } from '../../shared/types';
import { PromptService } from '../../network/search/PromptService';

export class ProvenanceTracker {
  private promptService: PromptService;

  constructor(promptService: PromptService) {
    this.promptService = promptService;
  }

  async buildProvenanceChain(
    generatedContent: string,
    sourceRefs: SourceRef[]
  ): Promise<ProvenanceChain> {
    if (!generatedContent || sourceRefs.length === 0) {
      return { claims: [] };
    }

    const response = await this.promptService.executeWithRetry({
      system: `You are a fact-checking assistant. Identify individual claims in the text and match them to source references. Score confidence based on evidence strength.`,
      user: `Identify claims in this text and match to sources:

TEXT:
${generatedContent.slice(0, 4000)}

SOURCES:
${sourceRefs.map((s, i) => `[${i}] ${s.fileName}: "${s.excerpt}"`).join('\n')}

Return JSON:
{"claims":[{"statement":"the claim","sourceIndices":[0,1],"confidence":0.85,"synthesisNotes":"how sources were interpreted"}]}`,
      jsonMode: true,
      maxTokens: 4096,
      temperature: 0.2,
    });

    try {
      const parsed = PromptService.extractJSON<{
        claims: Array<{
          statement: string;
          sourceIndices: number[];
          confidence: number;
          synthesisNotes: string;
        }>;
      }>(response);

      const claims: Claim[] = (parsed.claims ?? []).map((c) => ({
        statement: c.statement ?? '',
        sourceRefs: (c.sourceIndices ?? [])
          .filter((i) => i >= 0 && i < sourceRefs.length)
          .map((i) => sourceRefs[i]),
        confidence: Math.max(0, Math.min(1, c.confidence ?? 0.5)),
        synthesisNotes: c.synthesisNotes ?? '',
      }));

      return { claims };
    } catch {
      return { claims: [] };
    }
  }

  validateChain(chain: ProvenanceChain): { valid: boolean; unlinkedClaims: Claim[] } {
    const unlinked = chain.claims.filter((c) => c.sourceRefs.length === 0);
    return { valid: unlinked.length === 0, unlinkedClaims: unlinked };
  }
}
