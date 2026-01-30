import type { DocumentAssetType, GeneratedAsset, ProvenanceChain } from '@/types/asset.ts'
import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'
import type { LlmProvider } from '@/network/llm/types.ts'
import { executePrompt } from '@/network/prompt-execution.service.ts'
import { extractProvenance, storeProvenance } from '@/services/provenance-tracker.ts'
import { storage } from '@/services/storage.service.ts'

export function buildDocumentPrompt(
  type: DocumentAssetType,
  concept: Concept,
  analysis?: AnalysisResult
): { system: string; user: string } {
  const prompts: Record<DocumentAssetType, { system: string; user: string }> = {
    executive_summary: {
      system: `You are an executive summary writer. Create a concise 1-2 page summary that captures the essence of the concept for senior decision-makers.

Include:
- Brief overview and value proposition
- Key market opportunity
- Competitive advantages
- Critical success factors
- High-level recommendations

Use clear, professional language. Focus on strategic insights.`,
      user: `Concept: ${concept.name}
Description: ${concept.description}
Domain: ${concept.domain}
Themes: ${concept.themes.join(', ')}
${analysis ? `\nAnalysis Score: ${analysis.compositeScore}/100 (${analysis.tier})
Key Risks: ${analysis.keyRisks.join('; ')}
Recommended Steps: ${analysis.recommendedNextSteps.join('; ')}` : ''}

Generate an executive summary.`,
    },

    pitch_deck: {
      system: `You are a pitch deck writer. Create compelling slide content (10-15 slides) for investor presentations.

Structure:
1. Problem statement
2. Solution overview
3. Market opportunity
4. Product/technology
5. Business model
6. Competitive landscape
7. Go-to-market strategy
8. Team & execution
9. Financial projections
10. The ask

Use bullet points, clear headlines, and persuasive language.`,
      user: `Concept: ${concept.name}
Description: ${concept.description}
${analysis ? `\nMarket Viability: ${analysis.marketViability.score}/100
Technical Feasibility: ${analysis.technicalFeasibility.score}/100
Investment Potential: ${analysis.investmentPotential.score}/100` : ''}

Generate pitch deck slide content with clear structure.`,
    },

    one_pager: {
      system: `You are creating a one-page concept brief. Distill the concept into a single page that communicates the core idea and its value.

Include:
- Concept name and tagline
- Problem & solution (2-3 sentences each)
- Key benefits (3-5 bullets)
- Target market
- Differentiation
- Next steps

Be extremely concise. Every word counts.`,
      user: `Concept: ${concept.name}
Description: ${concept.description}
Abstraction Level: ${concept.abstractionLevel}
${analysis ? `\nComposite Score: ${analysis.compositeScore}/100` : ''}

Generate a one-page brief.`,
    },

    technical_brief: {
      system: `You are a technical writer. Create a detailed technical brief explaining the concept's implementation, architecture, and engineering considerations.

Include:
- Technical architecture overview
- Key technologies and approaches
- Implementation considerations
- Technical risks and mitigations
- System requirements
- Integration points
- Scalability considerations

Use precise technical language. Focus on feasibility and implementation details.`,
      user: `Concept: ${concept.name}
Description: ${concept.description}
Domain: ${concept.domain}
${analysis ? `\nTechnical Feasibility Analysis: ${analysis.technicalFeasibility.analysis}
Technical Score: ${analysis.technicalFeasibility.score}/100` : ''}

Generate a comprehensive technical brief.`,
    },

    market_report: {
      system: `You are a market research analyst. Create a detailed market analysis report.

Include:
- Market overview and size
- Target segments and personas
- Competitive landscape analysis
- Market trends and drivers
- Entry barriers and opportunities
- Positioning recommendations
- Go-to-market considerations

Use data-driven language. Support claims with evidence from sources.`,
      user: `Concept: ${concept.name}
Description: ${concept.description}
Domain: ${concept.domain}
${analysis ? `\nMarket Viability Analysis: ${analysis.marketViability.analysis}
Market Score: ${analysis.marketViability.score}/100
Supporting Evidence: ${analysis.supportingEvidence.map(e => e.citation).join('; ')}` : ''}

Generate a market analysis report.`,
    },

    whitepaper: {
      system: `You are a whitepaper author. Create an authoritative, in-depth document that explores the concept comprehensively.

Structure:
- Abstract
- Introduction and background
- Problem analysis
- Proposed solution/approach
- Technical/methodological details
- Use cases and applications
- Comparative analysis
- Future implications
- Conclusion

Use formal academic/professional tone. Include detailed explanations and reasoning.`,
      user: `Concept: ${concept.name}
Description: ${concept.description}
Domain: ${concept.domain}
Themes: ${concept.themes.join(', ')}
Abstraction Level: ${concept.abstractionLevel}
${analysis ? `\nExecutive Summary: ${analysis.executiveSummary}
Composite Score: ${analysis.compositeScore}/100` : ''}

Generate a comprehensive whitepaper.`,
    },
  }

  return prompts[type]
}

export async function generateDocument(
  type: DocumentAssetType,
  concept: Concept,
  provider: LlmProvider,
  analysis?: AnalysisResult
): Promise<GeneratedAsset> {
  const { system, user } = buildDocumentPrompt(type, concept, analysis)

  // Generate content
  const content = await executePrompt(provider, system, user, {
    temperature: 0.7,
    maxTokens: 4096,
  })

  // Create text blob (placeholder until PDF generation is added)
  const blob = new Blob([content], { type: 'text/plain' })

  // Extract provenance
  let provenance: ProvenanceChain
  try {
    provenance = await extractProvenance(content, concept, provider)
  } catch {
    provenance = { claims: [] }
  }

  // Create asset record
  const asset: GeneratedAsset = {
    id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    assetType: type,
    format: 'pdf', // Will be actual PDF once jspdf is integrated
    conceptId: concept.id,
    fileName: `${concept.name.replace(/\s+/g, '_')}_${type}.txt`,
    blob,
    provenance,
    generatedAt: new Date(),
  }

  // Store asset and provenance
  await storage.put('assets', asset)
  await storeProvenance(concept.id, asset.id, provenance)

  return asset
}
