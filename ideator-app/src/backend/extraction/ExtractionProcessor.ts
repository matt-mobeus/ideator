// ============================================================================
// IDEATOR — Extraction Processor (BE-3.2)
// Executes multi-pass concept extraction via LLM
// ============================================================================

import type { Concept, FileRecord, SourceRef } from '../../shared/types';
import { AbstractionLevel } from '../../shared/types';
import { PromptService } from '../../network/search/PromptService';
import { ExtractionPromptBuilder } from './ExtractionPromptBuilder';
import { generateId } from '../../shared/utils';

export interface RawConcept {
  name: string;
  description: string;
  abstractionLevel: string;
  domain: string;
  themes: string[];
  sourceExcerpts: Array<{ text: string; location: string }>;
  parentConcept?: string | null;
  childConcepts?: string[];
  relatedConcepts?: string[];
}

const ABSTRACTION_MAP: Record<string, AbstractionLevel> = {
  L1_SPECIFIC: AbstractionLevel.L1_SPECIFIC,
  L2_APPROACH: AbstractionLevel.L2_APPROACH,
  L3_PARADIGM: AbstractionLevel.L3_PARADIGM,
};

export class ExtractionProcessor {
  private promptService: PromptService;
  private promptBuilder: ExtractionPromptBuilder;

  constructor(promptService: PromptService) {
    this.promptService = promptService;
    this.promptBuilder = new ExtractionPromptBuilder();
  }

  async extract(files: FileRecord[]): Promise<Concept[]> {
    const allRawConcepts: RawConcept[] = [];

    for (const file of files) {
      if (!file.textCorpus) continue;
      const chunks = this.promptBuilder.chunkText(file.textCorpus, file.name);
      const prompts = chunks.map((chunk) => this.promptBuilder.buildPass1Prompt(chunk));
      const responses = await this.promptService.executeBatch(prompts);

      for (const response of responses) {
        try {
          const extracted = PromptService.extractJSON<RawConcept[]>(response);
          allRawConcepts.push(...extracted);
        } catch {
          // Skip unparseable
        }
      }
    }

    if (allRawConcepts.length === 0) return [];

    const deduped = this.deduplicateConcepts(allRawConcepts);

    // Pass 2
    const pass2Response = await this.promptService.executeWithRetry(
      this.promptBuilder.buildPass2Prompt(deduped)
    );
    let classified: RawConcept[];
    try {
      classified = PromptService.extractJSON<RawConcept[]>(pass2Response);
    } catch {
      classified = deduped;
    }

    const nameToId = new Map<string, string>();
    const concepts: Concept[] = classified.map((raw) => {
      const id = generateId();
      nameToId.set(raw.name.toLowerCase(), id);

      const sourceReferences: SourceRef[] = (raw.sourceExcerpts ?? []).map((ex) => ({
        fileId: files[0]?.id ?? '',
        fileName: files[0]?.name ?? '',
        location: ex.location ?? '',
        excerpt: (ex.text ?? '').slice(0, 500),
        context: '',
      }));

      return {
        id,
        name: raw.name,
        description: raw.description ?? '',
        abstractionLevel: ABSTRACTION_MAP[raw.abstractionLevel] ?? AbstractionLevel.L1_SPECIFIC,
        domain: raw.domain ?? 'General',
        themes: raw.themes ?? [],
        parentConcepts: [],
        childConcepts: [],
        relatedConcepts: [],
        sourceReferences,
        extractionTimestamp: new Date(),
        clusterId: '',
      };
    });

    // Resolve relationships
    for (let i = 0; i < classified.length; i++) {
      const raw = classified[i];
      const concept = concepts[i];
      if (raw.parentConcept) {
        const pid = nameToId.get(raw.parentConcept.toLowerCase());
        if (pid) concept.parentConcepts.push(pid);
      }
      for (const cn of raw.childConcepts ?? []) {
        const cid = nameToId.get(cn.toLowerCase());
        if (cid) concept.childConcepts.push(cid);
      }
      for (const rn of raw.relatedConcepts ?? []) {
        const rid = nameToId.get(rn.toLowerCase());
        if (rid) concept.relatedConcepts.push(rid);
      }
    }

    return concepts;
  }

  private deduplicateConcepts(concepts: RawConcept[]): RawConcept[] {
    const seen = new Map<string, RawConcept>();
    for (const c of concepts) {
      const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(key)) {
        seen.set(key, c);
      } else {
        const existing = seen.get(key)!;
        existing.sourceExcerpts.push(...(c.sourceExcerpts ?? []));
        existing.themes = [...new Set([...(existing.themes ?? []), ...(c.themes ?? [])])];
      }
    }
    return Array.from(seen.values());
  }
}
