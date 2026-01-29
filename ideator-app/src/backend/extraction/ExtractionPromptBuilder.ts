// ============================================================================
// IDEATOR — Extraction Prompt Builder (BE-3.1)
// Builds LLM prompts for concept extraction from text corpus
// ============================================================================

import type { Prompt } from '../../network/search/PromptService';

/** A chunk of text with context for extraction */
export interface TextChunk {
  text: string;
  fileName: string;
  location: string;
  chunkIndex: number;
  totalChunks: number;
}

const DEFAULT_CHUNK_SIZE = 3000;
const CHUNK_OVERLAP = 200;

export class ExtractionPromptBuilder {
  chunkText(text: string, fileName: string, maxChunkSize = DEFAULT_CHUNK_SIZE): TextChunk[] {
    if (!text || text.length === 0) return [];

    const chunks: TextChunk[] = [];
    let offset = 0;

    while (offset < text.length) {
      let end = Math.min(offset + maxChunkSize, text.length);

      if (end < text.length) {
        const lastSentence = text.lastIndexOf('. ', end);
        if (lastSentence > offset + maxChunkSize * 0.5) {
          end = lastSentence + 2;
        }
      }

      chunks.push({
        text: text.slice(offset, end),
        fileName,
        location: `chars ${offset}-${end}`,
        chunkIndex: chunks.length,
        totalChunks: 0,
      });

      offset = end - CHUNK_OVERLAP;
      if (offset >= text.length) break;
    }

    for (const c of chunks) c.totalChunks = chunks.length;
    return chunks;
  }

  buildPass1Prompt(chunk: TextChunk): Prompt {
    return {
      system: `You are a concept extraction engine. Identify distinct technologies, methods, principles, frameworks, and innovations from text. Extract concrete, specific concepts.

For each concept provide: name (2-5 words), description (2-3 sentences), themes (1-3 tags), sourceExcerpts (exact quotes, max 2).

Return a JSON array.`,
      user: `Source: {{fileName}} (chunk {{chunkIndex}}/{{totalChunks}})
Location: {{location}}

TEXT:
{{text}}

Extract all distinct concepts. Return JSON array:
[{"name":"Concept Name","description":"2-3 sentences","themes":["t1","t2"],"sourceExcerpts":[{"text":"exact quote","location":"{{location}}"}]}]`,
      variables: {
        fileName: chunk.fileName,
        chunkIndex: String(chunk.chunkIndex + 1),
        totalChunks: String(chunk.totalChunks),
        location: chunk.location,
        text: chunk.text,
      },
      jsonMode: true,
      maxTokens: 4096,
      temperature: 0.3,
    };
  }

  buildPass2Prompt(rawConcepts: unknown[]): Prompt {
    return {
      system: `You are a concept classification engine. Assign each concept an abstraction level:
- L1_SPECIFIC: Concrete technology/tool/method
- L2_APPROACH: Methodology/framework/approach
- L3_PARADIGM: High-level paradigm/field

Also assign a domain and identify parent/child/related relationships.`,
      user: `Classify these concepts:

CONCEPTS:
{{concepts}}

Return JSON array:
[{"name":"name","description":"desc","abstractionLevel":"L1_SPECIFIC|L2_APPROACH|L3_PARADIGM","domain":"domain","themes":["t1"],"parentConcept":"parent name or null","childConcepts":["names"],"relatedConcepts":["names"],"sourceExcerpts":[{"text":"q","location":"l"}]}]`,
      variables: {
        concepts: JSON.stringify(rawConcepts, null, 2),
      },
      jsonMode: true,
      maxTokens: 8192,
      temperature: 0.2,
    };
  }

  buildPass3Prompt(conceptsWithLevels: unknown[]): Prompt {
    return {
      system: `You are a concept clustering engine. Group concepts into thematic clusters by domain. Each cluster should represent a coherent area of innovation.`,
      user: `Group these concepts into clusters:

CONCEPTS:
{{concepts}}

Return JSON:
{"clusters":[{"name":"Cluster Name","summary":"1-2 sentence description","conceptNames":["c1","c2"]}]}`,
      variables: {
        concepts: JSON.stringify(conceptsWithLevels, null, 2),
      },
      jsonMode: true,
      maxTokens: 4096,
      temperature: 0.2,
    };
  }
}
