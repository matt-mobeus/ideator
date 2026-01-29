// ================================================================
// IDEATOR — Document Generator (BE-6.1)
// Generates document assets from concept analysis data
// ================================================================

import type { Concept, AnalysisResult, GeneratedAsset } from '../../shared/types';
import { AssetType } from '../../shared/types';
import { PromptService } from '../../network/search/PromptService';
import { ProvenanceTracker } from './ProvenanceTracker';
import { generateId } from '../../shared/utils';

const ASSET_PROMPTS: Record<string, string> = {
  [AssetType.EXECUTIVE_SUMMARY]: 'Write a 1-page executive summary covering market opportunity, feasibility assessment, and investment recommendation.',
  [AssetType.PITCH_DECK]: 'Write pitch deck content with slides: Problem, Solution, Market Size, Competitive Landscape, Business Model, Team Needs, Financial Projections, Ask.',
  [AssetType.ONE_PAGER]: 'Write a concise 1-pager covering: what it is, why it matters, market opportunity, and next steps.',
  [AssetType.TECHNICAL_BRIEF]: 'Write a technical brief covering: technology overview, architecture, implementation challenges, and technical roadmap.',
  [AssetType.MARKET_REPORT]: 'Write a market analysis report: market size, growth trends, competitive landscape, regulatory environment, and investment outlook.',
  [AssetType.WHITEPAPER]: 'Write a whitepaper: abstract, introduction, technical approach, market analysis, implementation strategy, and conclusion.',
};

export class DocumentGenerator {
  private promptService: PromptService;
  private provenanceTracker: ProvenanceTracker;

  constructor(promptService: PromptService) {
    this.promptService = promptService;
    this.provenanceTracker = new ProvenanceTracker(promptService);
  }

  async generate(
    concept: Concept,
    analysis: AnalysisResult,
    assetType: AssetType
  ): Promise<GeneratedAsset> {
    const prompt = ASSET_PROMPTS[assetType] ?? ASSET_PROMPTS[AssetType.EXECUTIVE_SUMMARY];

    const response = await this.promptService.executeWithRetry({
      system: `You are a professional business writer. Generate well-structured, data-driven documents. Use markdown formatting. Include specific data points and cite sources where relevant.`,
      user: `${prompt}

CONCEPT: ${concept.name}
DESCRIPTION: ${concept.description}
DOMAIN: ${concept.domain}

ANALYSIS:
- Composite Score: ${analysis.compositeScore}/100 (${analysis.validityTier})
- Market Viability: ${analysis.marketViability.score}/100
- Technical Feasibility: ${analysis.technicalFeasibility.score}/100
- Investment Potential: ${analysis.investmentPotential.score}/100

EXECUTIVE SUMMARY: ${analysis.qualitativeReport.executiveSummary}
KEY RISKS: ${analysis.qualitativeReport.keyRisks.join('; ')}
NEXT STEPS: ${analysis.qualitativeReport.recommendedNextSteps.join('; ')}`,
      maxTokens: 8192,
      temperature: 0.5,
    });

    const content = response.content;

    // Build provenance chain
    const provenance = await this.provenanceTracker.buildProvenanceChain(
      content,
      concept.sourceReferences
    );

    const blob = new Blob([content], { type: 'text/markdown' });

    return {
      id: generateId(),
      assetType,
      conceptId: concept.id,
      filePath: `assets/${concept.id}/${assetType.toLowerCase()}.md`,
      blob,
      mimeType: 'text/markdown',
      generatedTimestamp: new Date(),
      provenance,
    };
  }
}
