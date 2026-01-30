import type { DocumentAssetType, GeneratedAsset, ProvenanceChain } from '@/types/asset.ts'
import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'
import type { LlmProvider } from '@/network/llm/types.ts'
import { executePrompt } from '@/network/prompt-execution.service.ts'
import { extractProvenance, storeProvenance } from '@/services/provenance-tracker.ts'
import { storage } from '@/services/storage.service.ts'
import { buildDocumentPrompt } from '@/services/document-prompts.ts'
import { logger } from '@/utils/logger.ts'

export { buildDocumentPrompt } from '@/services/document-prompts.ts'

function generateAssetId(): string {
  return `asset_${Date.now()}_${crypto.randomUUID()}`
}

function sanitizeFileName(name: string): string {
  return name.replace(/\s+/g, '_')
}

async function executeGeneration(
  provider: LlmProvider,
  system: string,
  user: string
): Promise<string> {
  return await executePrompt(provider, system, user, {
    temperature: 0.7,
    maxTokens: 4096,
  })
}

function createTextBlob(content: string): Blob {
  return new Blob([content], { type: 'text/plain' })
}

async function extractProvenanceWithFallback(
  content: string,
  concept: Concept,
  provider: LlmProvider
): Promise<ProvenanceChain> {
  try {
    return await extractProvenance(content, concept, provider)
  } catch (error) {
    logger.warn('Failed to extract provenance', {
      context: 'document-generator',
      data: { error },
    })
    return { claims: [] }
  }
}

function buildAssetRecord(
  type: DocumentAssetType,
  concept: Concept,
  blob: Blob,
  provenance: ProvenanceChain
): GeneratedAsset {
  const fileName = `${sanitizeFileName(concept.name)}_${type}.txt`

  return {
    id: generateAssetId(),
    assetType: type,
    format: 'pdf', // Will be actual PDF once jspdf is integrated
    conceptId: concept.id,
    fileName,
    blob,
    provenance,
    generatedAt: new Date(),
  }
}

async function persistAsset(
  asset: GeneratedAsset,
  conceptId: string
): Promise<void> {
  await storage.put('assets', asset)
  await storeProvenance(conceptId, asset.id, asset.provenance)
}

export async function generateDocument(
  type: DocumentAssetType,
  concept: Concept,
  provider: LlmProvider,
  analysis?: AnalysisResult
): Promise<GeneratedAsset> {
  const { system, user } = buildDocumentPrompt(type, concept, analysis)

  const content = await executeGeneration(provider, system, user)
  const blob = createTextBlob(content)
  const provenance = await extractProvenanceWithFallback(
    content,
    concept,
    provider
  )

  const asset = buildAssetRecord(type, concept, blob, provenance)
  await persistAsset(asset, concept.id)

  return asset
}
