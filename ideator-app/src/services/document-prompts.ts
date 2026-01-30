import type { DocumentAssetType } from '@/types/asset.ts'
import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'

const MAX_STRING_LENGTH = 1000

/**
 * Sanitizes user input by escaping special characters and truncating
 */
function sanitizeInput(input: string): string {
  if (!input) return ''

  // Truncate to max length
  const truncated = input.length > MAX_STRING_LENGTH
    ? input.substring(0, MAX_STRING_LENGTH) + '...'
    : input

  // Escape special characters for LLM prompt safety
  return truncated
    .replace(/\\/g, '\\\\')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
}

/**
 * Sanitizes array of strings
 */
function sanitizeArray(arr: string[]): string[] {
  return arr.map(item => sanitizeInput(item))
}

const EXECUTIVE_SUMMARY_SYSTEM = `You are an executive summary writer. Create a concise 1-2 page summary that captures the essence of the concept for senior decision-makers.

Include:
- Brief overview and value proposition
- Key market opportunity
- Competitive advantages
- Critical success factors
- High-level recommendations

Use clear, professional language. Focus on strategic insights.`

const PITCH_DECK_SYSTEM = `You are a pitch deck writer. Create compelling slide content (10-15 slides) for investor presentations.

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

Use bullet points, clear headlines, and persuasive language.`

const ONE_PAGER_SYSTEM = `You are creating a one-page concept brief. Distill the concept into a single page that communicates the core idea and its value.

Include:
- Concept name and tagline
- Problem & solution (2-3 sentences each)
- Key benefits (3-5 bullets)
- Target market
- Differentiation
- Next steps

Be extremely concise. Every word counts.`

const TECHNICAL_BRIEF_SYSTEM = `You are a technical writer. Create a detailed technical brief explaining the concept's implementation, architecture, and engineering considerations.

Include:
- Technical architecture overview
- Key technologies and approaches
- Implementation considerations
- Technical risks and mitigations
- System requirements
- Integration points
- Scalability considerations

Use precise technical language. Focus on feasibility and implementation details.`

const MARKET_REPORT_SYSTEM = `You are a market research analyst. Create a detailed market analysis report.

Include:
- Market overview and size
- Target segments and personas
- Competitive landscape analysis
- Market trends and drivers
- Entry barriers and opportunities
- Positioning recommendations
- Go-to-market considerations

Use data-driven language. Support claims with evidence from sources.`

const WHITEPAPER_SYSTEM = `You are a whitepaper author. Create an authoritative, in-depth document that explores the concept comprehensively.

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

Use formal academic/professional tone. Include detailed explanations and reasoning.`

function buildExecutiveSummaryPrompt(
  concept: Concept,
  analysis?: AnalysisResult
): string {
  const name = sanitizeInput(concept.name)
  const description = sanitizeInput(concept.description)
  const domain = sanitizeInput(concept.domain)
  const themes = sanitizeArray(concept.themes).join(', ')

  let prompt = `Concept: ${name}
Description: ${description}
Domain: ${domain}
Themes: ${themes}`

  if (analysis) {
    const risks = sanitizeArray(analysis.keyRisks).join('; ')
    const steps = sanitizeArray(analysis.recommendedNextSteps).join('; ')
    prompt += `\nAnalysis Score: ${analysis.compositeScore}/100 (${analysis.tier})
Key Risks: ${risks}
Recommended Steps: ${steps}`
  }

  prompt += '\n\nGenerate an executive summary.'
  return prompt
}

function buildPitchDeckPrompt(
  concept: Concept,
  analysis?: AnalysisResult
): string {
  const name = sanitizeInput(concept.name)
  const description = sanitizeInput(concept.description)

  let prompt = `Concept: ${name}
Description: ${description}`

  if (analysis) {
    prompt += `\nMarket Viability: ${analysis.marketViability.score}/100
Technical Feasibility: ${analysis.technicalFeasibility.score}/100
Investment Potential: ${analysis.investmentPotential.score}/100`
  }

  prompt += '\n\nGenerate pitch deck slide content with clear structure.'
  return prompt
}

function buildOnePagerPrompt(
  concept: Concept,
  analysis?: AnalysisResult
): string {
  const name = sanitizeInput(concept.name)
  const description = sanitizeInput(concept.description)
  const abstractionLevel = sanitizeInput(concept.abstractionLevel)

  let prompt = `Concept: ${name}
Description: ${description}
Abstraction Level: ${abstractionLevel}`

  if (analysis) {
    prompt += `\nComposite Score: ${analysis.compositeScore}/100`
  }

  prompt += '\n\nGenerate a one-page brief.'
  return prompt
}

function buildTechnicalBriefPrompt(
  concept: Concept,
  analysis?: AnalysisResult
): string {
  const name = sanitizeInput(concept.name)
  const description = sanitizeInput(concept.description)
  const domain = sanitizeInput(concept.domain)

  let prompt = `Concept: ${name}
Description: ${description}
Domain: ${domain}`

  if (analysis) {
    const techAnalysis = sanitizeInput(analysis.technicalFeasibility.analysis)
    prompt += `\nTechnical Feasibility Analysis: ${techAnalysis}
Technical Score: ${analysis.technicalFeasibility.score}/100`
  }

  prompt += '\n\nGenerate a comprehensive technical brief.'
  return prompt
}

function buildMarketReportPrompt(
  concept: Concept,
  analysis?: AnalysisResult
): string {
  const name = sanitizeInput(concept.name)
  const description = sanitizeInput(concept.description)
  const domain = sanitizeInput(concept.domain)

  let prompt = `Concept: ${name}
Description: ${description}
Domain: ${domain}`

  if (analysis) {
    const marketAnalysis = sanitizeInput(analysis.marketViability.analysis)
    const citations = analysis.supportingEvidence
      .map(e => sanitizeInput(e.citation))
      .join('; ')

    prompt += `\nMarket Viability Analysis: ${marketAnalysis}
Market Score: ${analysis.marketViability.score}/100
Supporting Evidence: ${citations}`
  }

  prompt += '\n\nGenerate a market analysis report.'
  return prompt
}

function buildWhitepaperPrompt(
  concept: Concept,
  analysis?: AnalysisResult
): string {
  const name = sanitizeInput(concept.name)
  const description = sanitizeInput(concept.description)
  const domain = sanitizeInput(concept.domain)
  const themes = sanitizeArray(concept.themes).join(', ')
  const abstractionLevel = sanitizeInput(concept.abstractionLevel)

  let prompt = `Concept: ${name}
Description: ${description}
Domain: ${domain}
Themes: ${themes}
Abstraction Level: ${abstractionLevel}`

  if (analysis) {
    const execSummary = sanitizeInput(analysis.executiveSummary)
    prompt += `\nExecutive Summary: ${execSummary}
Composite Score: ${analysis.compositeScore}/100`
  }

  prompt += '\n\nGenerate a comprehensive whitepaper.'
  return prompt
}

export function buildDocumentPrompt(
  type: DocumentAssetType,
  concept: Concept,
  analysis?: AnalysisResult
): { system: string; user: string } {
  const builders = {
    executive_summary: {
      system: EXECUTIVE_SUMMARY_SYSTEM,
      user: buildExecutiveSummaryPrompt(concept, analysis),
    },
    pitch_deck: {
      system: PITCH_DECK_SYSTEM,
      user: buildPitchDeckPrompt(concept, analysis),
    },
    one_pager: {
      system: ONE_PAGER_SYSTEM,
      user: buildOnePagerPrompt(concept, analysis),
    },
    technical_brief: {
      system: TECHNICAL_BRIEF_SYSTEM,
      user: buildTechnicalBriefPrompt(concept, analysis),
    },
    market_report: {
      system: MARKET_REPORT_SYSTEM,
      user: buildMarketReportPrompt(concept, analysis),
    },
    whitepaper: {
      system: WHITEPAPER_SYSTEM,
      user: buildWhitepaperPrompt(concept, analysis),
    },
  }

  return builders[type]
}
