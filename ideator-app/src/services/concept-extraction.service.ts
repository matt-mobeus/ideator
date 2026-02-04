/**
 * Orchestrates concept extraction from processed text.
 */

import type { Concept, SourceRef, AbstractionLevel } from '@/types/concept.ts'
import type { LlmConfig } from '@/types/settings.ts'
import { buildExtractionPrompt } from './prompt-builder.ts'
import { executePrompt } from '@/network/prompt-execution.service.ts'
import { createLlmProvider } from '@/network/llm/index.ts'
import { storage } from '@/services/storage.service.ts'
import { parseJsonSafe } from '@/utils/json-parse.ts'

interface RawConcept {
  name: string
  description: string
  abstractionLevel: AbstractionLevel
  domain: string
  themes: string[]
  parentConcepts: string[]
  childConcepts: string[]
  relatedConcepts: string[]
}

const VALID_LEVELS = ['L1_SPECIFIC', 'L2_APPROACH', 'L3_PARADIGM'] as const

export function normalizeConcept(concept: Concept): Concept {
  const domain = (concept.domain || 'General')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)[0] || 'General'

  const abstractionLevel = (VALID_LEVELS as readonly string[]).includes(concept.abstractionLevel)
    ? concept.abstractionLevel
    : 'L2_APPROACH'

  let themes: string[]
  if (Array.isArray(concept.themes) && concept.themes.length > 0) {
    themes = concept.themes.map((t) => t.trim()).filter(Boolean)
  } else if (typeof concept.themes === 'string' && concept.themes) {
    themes = (concept.themes as string).split(',').map((t) => t.trim()).filter(Boolean)
  } else {
    themes = ['General']
  }
  if (themes.length === 0) themes = ['General']

  return { ...concept, domain, abstractionLevel, themes }
}

export async function extractConcepts(
  text: string,
  sourceRef: SourceRef,
  llmConfig: LlmConfig,
  domain?: string,
): Promise<Concept[]> {
  const provider = createLlmProvider(llmConfig)
  const prompt = buildExtractionPrompt(text, domain)
  const response = await executePrompt(provider, prompt.system, prompt.user)

  const rawConcepts = parseJsonSafe<RawConcept[]>(response)

  const concepts: Concept[] = rawConcepts.map((rc) => ({
    id: crypto.randomUUID(),
    name: rc.name,
    description: rc.description,
    abstractionLevel: rc.abstractionLevel,
    domain: rc.domain,
    themes: rc.themes,
    parentConcepts: rc.parentConcepts,
    childConcepts: rc.childConcepts,
    relatedConcepts: rc.relatedConcepts,
    sourceReferences: [sourceRef],
    clusterId: '',
    extractionTimestamp: new Date(),
  }))

  for (const concept of concepts) {
    await storage.put('concepts', concept)
  }

  return concepts.map(normalizeConcept)
}

export async function extractFromMultipleFiles(
  files: { text: string; sourceRef: SourceRef }[],
  llmConfig: LlmConfig,
  domain?: string,
): Promise<Concept[]> {
  const allConcepts: Concept[] = []

  for (const file of files) {
    const concepts = await extractConcepts(file.text, file.sourceRef, llmConfig, domain)
    allConcepts.push(...concepts)
  }

  // Deduplicate by name (case-insensitive), merging sourceReferences
  const seen = new Map<string, Concept>()
  for (const concept of allConcepts) {
    const key = concept.name.toLowerCase()
    const existing = seen.get(key)
    if (existing) {
      existing.sourceReferences.push(...concept.sourceReferences)
    } else {
      seen.set(key, concept)
    }
  }

  return Array.from(seen.values()).map(normalizeConcept)
}
