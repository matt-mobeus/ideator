import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult, SubScore } from '@/types/analysis.ts'
import { tierFromScore } from '@/types/analysis.ts'
import type { LlmProvider } from '@/network/llm/types.ts'
import { executePrompt } from '@/network/prompt-execution.service.ts'
import {
  buildMarketQuery,
  buildTechQuery,
  buildInvestmentQuery,
  aggregateSearchResults,
} from '@/network/search/index.ts'
import { calculateCompositeScore } from './validity-scorer.ts'
import { storage } from './storage.service.ts'

interface AnalysisResponse {
  marketViability: SubScore
  technicalFeasibility: SubScore
  investmentPotential: SubScore
  executiveSummary: string
  keyRisks: string[]
  recommendedNextSteps: string[]
  supportingEvidence: { citation: string; sourceUrl?: string }[]
}

/**
 * Builds analysis prompt for LLM to score and analyze a concept
 */
export function buildAnalysisPrompt(
  concept: Concept,
  searchResults: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are an expert business analyst and venture capital advisor.
Your task is to analyze startup concepts and provide detailed, evidence-based assessments
across three dimensions: market viability, technical feasibility, and investment potential.

For each dimension, provide:
- A score from 0-100
- Specific factors that influenced the score (as a key-value object where keys are factor names and values are weights 0-10)
- A detailed analysis paragraph

Also provide:
- An executive summary (2-3 sentences)
- Key risks (array of strings)
- Recommended next steps (array of strings)
- Supporting evidence with citations (array of objects with citation and optional sourceUrl)

Respond with valid JSON only, matching this structure:
{
  "marketViability": { "score": number, "factors": {}, "analysis": string },
  "technicalFeasibility": { "score": number, "factors": {}, "analysis": string },
  "investmentPotential": { "score": number, "factors": {}, "analysis": string },
  "executiveSummary": string,
  "keyRisks": string[],
  "recommendedNextSteps": string[],
  "supportingEvidence": [{ "citation": string, "sourceUrl": string }]
}`

  const userPrompt = `Analyze this concept:

**Name:** ${concept.name}
**Description:** ${concept.description}
**Domain:** ${concept.domain}
**Abstraction Level:** ${concept.abstractionLevel}
**Themes:** ${concept.themes.join(', ')}

**Market Research:**
${searchResults}

Provide a comprehensive analysis with scores, factors, and actionable insights.`

  return { systemPrompt, userPrompt }
}

/**
 * Analyzes a concept using web search + LLM reasoning
 */
export async function analyzeConcept(
  concept: Concept,
  provider: LlmProvider
): Promise<AnalysisResult> {
  // Get API key from settings
  const settings = await storage.getById<{ id: string; serperApiKey?: string }>('settings', 'app-settings')
  const apiKey = settings?.serperApiKey || ''

  // Build search queries
  const queries = [
    buildMarketQuery(concept.name, concept.domain),
    buildTechQuery(concept.name),
    buildInvestmentQuery(concept.name, concept.domain),
  ]

  // Aggregate search results (handles parallel execution internally)
  const searchResults = await aggregateSearchResults(queries, apiKey)

  // Format results for prompt
  const aggregatedResults = searchResults
    .map((r) => `${r.title}: ${r.snippet} (${r.url})`)
    .join('\n')

  // Build prompt with concept + search data
  const { systemPrompt, userPrompt } = buildAnalysisPrompt(
    concept,
    aggregatedResults
  )

  // Execute LLM analysis
  const responseText = await executePrompt(provider, systemPrompt, userPrompt, {
    jsonMode: true,
  })

  // Parse LLM response
  let analysisData: AnalysisResponse
  try {
    analysisData = JSON.parse(responseText)
  } catch {
    // Attempt to strip markdown fences and retry
    try {
      const stripped = responseText.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '')
      analysisData = JSON.parse(stripped)
    } catch {
      throw new Error('Failed to parse LLM analysis response')
    }
  }

  // Validate required score fields
  if (
    !analysisData.marketViability?.score ||
    !analysisData.technicalFeasibility?.score ||
    !analysisData.investmentPotential?.score
  ) {
    throw new Error('LLM response missing required score fields')
  }

  // Calculate composite score
  const compositeScore = calculateCompositeScore(
    analysisData.marketViability.score,
    analysisData.technicalFeasibility.score,
    analysisData.investmentPotential.score
  )

  // Determine tier
  const tier = tierFromScore(compositeScore)

  // Build final result
  const result: AnalysisResult = {
    id: crypto.randomUUID(),
    conceptId: concept.id,
    compositeScore,
    tier,
    marketViability: analysisData.marketViability,
    technicalFeasibility: analysisData.technicalFeasibility,
    investmentPotential: analysisData.investmentPotential,
    executiveSummary: analysisData.executiveSummary,
    keyRisks: analysisData.keyRisks,
    recommendedNextSteps: analysisData.recommendedNextSteps,
    supportingEvidence: analysisData.supportingEvidence,
    analyzedAt: new Date(),
  }

  return result
}

/**
 * Analyzes a concept and stores the result
 */
export async function analyzeAndStore(
  concept: Concept,
  provider: LlmProvider
): Promise<AnalysisResult> {
  const result = await analyzeConcept(concept, provider)
  await storage.put('analyses', result)
  return result
}
