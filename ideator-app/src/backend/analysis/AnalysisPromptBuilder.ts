// ============================================================================
// IDEATOR — Analysis Prompt Builder (BE-4.1)
// Builds LLM prompts for market analysis
// ============================================================================

import type { Prompt } from '../../network/search/PromptService';
import type { Concept } from '../../shared/types';
import type { SearchContext } from '../../network/search/SearchAggregator';

export class AnalysisPromptBuilder {
  /** Build prompt for market viability assessment */
  buildMarketViabilityPrompt(concept: Concept, searchContext: SearchContext): Prompt {
    // TODO: System prompt with market viability scoring criteria
    // TODO: Factors: gap (30%), timing (25%), regulatory (20%), trends (25%)
    // TODO: User prompt with concept info + search results
    throw new Error('AnalysisPromptBuilder.buildMarketViabilityPrompt not yet implemented');
  }

  /** Build prompt for technical feasibility assessment */
  buildTechnicalFeasibilityPrompt(concept: Concept, searchContext: SearchContext): Prompt {
    // TODO: Factors: readiness (35%), breakthroughs (25%), infrastructure (20%), talent (20%)
    throw new Error('AnalysisPromptBuilder.buildTechnicalFeasibilityPrompt not yet implemented');
  }

  /** Build prompt for investment potential assessment */
  buildInvestmentPotentialPrompt(concept: Concept, searchContext: SearchContext): Prompt {
    // TODO: Factors: capital (25%), timeline (25%), exits (25%), climate (25%)
    throw new Error('AnalysisPromptBuilder.buildInvestmentPotentialPrompt not yet implemented');
  }

  /** Build prompt for executive summary and qualitative report */
  buildReportPrompt(concept: Concept, scores: unknown): Prompt {
    // TODO: Generate executive summary, risks, next steps
    throw new Error('AnalysisPromptBuilder.buildReportPrompt not yet implemented');
  }
}
