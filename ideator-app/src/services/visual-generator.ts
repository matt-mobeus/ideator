import type { VisualAssetType, GeneratedAsset, ProvenanceChain } from '@/types/asset.ts'
import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'
import type { LlmProvider } from '@/network/llm/types.ts'
import { executePrompt } from '@/network/prompt-execution.service.ts'
import { extractProvenance, storeProvenance } from '@/services/provenance-tracker.ts'
import { storage } from '@/services/storage.service.ts'
import { logger } from '@/utils/logger.ts'
import { VISUAL_PROMPTS } from './visual-prompts.ts'
import DOMPurify from 'dompurify'

export function buildVisualPrompt(
  type: VisualAssetType,
  concept: Concept,
  analysis?: AnalysisResult
): { system: string; user: string } {
  const prompt = VISUAL_PROMPTS[type]
  return {
    system: prompt.system,
    user: prompt.user(concept, analysis),
  }
}

export async function generateVisual(
  type: VisualAssetType,
  concept: Concept,
  provider: LlmProvider,
  analysis?: AnalysisResult
): Promise<GeneratedAsset> {
  const { system, user } = buildVisualPrompt(type, concept, analysis)

  // Generate SVG content
  const svgContent = await executePrompt(provider, system, user, {
    temperature: 0.7,
    maxTokens: 4096,
  })

  // Strip markdown code fences if present
  const cleanedSvg = svgContent
    .replace(/^```svg\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  // Sanitize SVG using DOMPurify to remove XSS vectors
  const sanitizedSvg = DOMPurify.sanitize(cleanedSvg, {
    USE_PROFILES: { svg: true },
  })

  // Create SVG blob
  const blob = new Blob([sanitizedSvg], { type: 'image/svg+xml' })

  // Extract provenance (track claims made in labels/text)
  let provenanceChain: ProvenanceChain
  try {
    provenanceChain = await extractProvenance(sanitizedSvg, concept, provider)
  } catch (error) {
    logger.warn('Failed to extract provenance for visual asset', { error })
    provenanceChain = { claims: [] }
  }

  // Create asset record with cryptographically secure ID
  const asset: GeneratedAsset = {
    id: `asset_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`,
    assetType: type,
    format: 'svg',
    conceptId: concept.id,
    fileName: `${concept.name.replace(/\s+/g, '_')}_${type}.svg`,
    blob,
    provenance: provenanceChain,
    generatedAt: new Date(),
  }

  // Store asset and provenance
  await storage.put('assets', asset)
  await storeProvenance(concept.id, asset.id, provenanceChain)

  return asset
}
