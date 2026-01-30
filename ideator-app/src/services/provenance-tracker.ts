import type { Concept } from '@/types/concept.ts'
import type { ProvenanceChain, Claim } from '@/types/asset.ts'
import type { LlmProvider } from '@/network/llm/types.ts'
import { executePrompt } from '@/network/prompt-execution.service.ts'
import { storage } from '@/services/storage.service.ts'
import type { ProvenanceRecord } from '@/db/database.ts'
import { logger } from '@/utils/logger'

interface RawClaim {
  statement: string
  sourceRefIndices: number[]
  confidence: number
  synthesisNotes: string
}

export function buildProvenancePrompt(
  content: string,
  concept: Concept
): { system: string; user: string } {
  const system = `You are a provenance tracking system. Extract factual claims from generated content and link them to source references.

Return a JSON array of claims, each with:
- statement: the factual claim made
- sourceRefIndices: array of indices (0-based) into the concept's sourceReferences array
- confidence: 0-1 score for claim reliability
- synthesisNotes: brief explanation of how sources support this claim

Example output:
[
  {
    "statement": "The market size is estimated at $5B",
    "sourceRefIndices": [0, 2],
    "confidence": 0.9,
    "synthesisNotes": "Directly cited from market research reports"
  }
]`

  const sourceList = concept.sourceReferences
    .map((ref, idx) => `[${idx}] ${ref.fileName} - ${ref.location}\n   "${ref.excerpt}"`)
    .join('\n\n')

  const user = `Concept: ${concept.name}
Description: ${concept.description}

Available Sources:
${sourceList}

Generated Content to Analyze:
${content}

Extract all factual claims and link to source references. Return JSON array only.`

  return { system, user }
}

export async function extractProvenance(
  content: string,
  concept: Concept,
  provider: LlmProvider
): Promise<ProvenanceChain> {
  const { system, user } = buildProvenancePrompt(content, concept)

  let response: string
  try {
    response = await executePrompt(provider, system, user, {
      temperature: 0.1,
      jsonMode: true,
    })
  } catch {
    return { claims: [] }
  }

  // Parse and validate JSON
  let rawClaims: RawClaim[]
  try {
    // Strip markdown code fences if present
    const cleaned = response
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    rawClaims = JSON.parse(cleaned)

    if (!Array.isArray(rawClaims)) {
      throw new Error('Expected array of claims')
    }
  } catch (err) {
    logger.error('Failed to parse provenance response:', err)
    return { claims: [] }
  }

  // Map indices to actual source references
  const claims: Claim[] = rawClaims.map((raw) => {
    const sourceRefs = raw.sourceRefIndices
      .filter((idx) => idx >= 0 && idx < concept.sourceReferences.length)
      .map((idx) => concept.sourceReferences[idx])

    return {
      statement: raw.statement,
      sourceRefs,
      confidence: raw.confidence,
      synthesisNotes: raw.synthesisNotes,
    }
  })

  return { claims }
}

export async function storeProvenance(
  conceptId: string,
  assetId: string,
  chain: ProvenanceChain
): Promise<void> {
  // Map ProvenanceChain to database format
  const record: ProvenanceRecord = {
    id: `prov_${assetId}_${Date.now()}`,
    conceptId,
    assetId,
    claims: chain.claims.map((claim) => ({
      statement: claim.statement,
      fileId: claim.sourceRefs[0]?.fileId || '',
      excerpt: claim.sourceRefs[0]?.excerpt || '',
      confidence: claim.confidence,
    })),
    createdAt: new Date(),
  }

  await storage.put('provenance', record)
}
