// ============================================================================
// IDEATOR — Analysis Prompt Builder (BE-4.1)
// Builds LLM prompts for market analysis
// ============================================================================

import type { Prompt } from '../../network/search/PromptService';
import type { Concept } from '../../shared/types';
import type { SearchContext } from '../../network/search/SearchAggregator';

export class AnalysisPromptBuilder {
  buildMarketViabilityPrompt(concept: Concept, searchContext: SearchContext): Prompt {
    return {
      system: `You are a market analysis expert. Score market viability 0-100 across:
- market_gap (30%): Unmet need? Addressable market size?
- timing (25%): Market readiness? Early adopters?
- regulatory (20%): Barriers or enablers?
- trends (25%): Supporting market trends?

Return weighted overall score and qualitative analysis.`,
      user: `CONCEPT: {{name}}
DESCRIPTION: {{description}}
DOMAIN: {{domain}}

RESEARCH:
{{searchContext}}

Return JSON: {"score":72,"factors":{"market_gap":80,"timing":70,"regulatory":60,"trends":75},"analysis":"paragraph..."}`,
      variables: {
        name: concept.name,
        description: concept.description,
        domain: concept.domain,
        searchContext: searchContext.formattedContext,
      },
      jsonMode: true,
      maxTokens: 2048,
      temperature: 0.3,
    };
  }

  buildTechnicalFeasibilityPrompt(concept: Concept, searchContext: SearchContext): Prompt {
    return {
      system: `You are a technical feasibility analyst. Score 0-100 across:
- readiness (35%): Technology readiness level
- breakthroughs (25%): Key breakthroughs needed?
- infrastructure (20%): Required infrastructure exists?
- talent (20%): Skilled talent available?`,
      user: `CONCEPT: {{name}}
DESCRIPTION: {{description}}
DOMAIN: {{domain}}

RESEARCH:
{{searchContext}}

Return JSON: {"score":65,"factors":{"readiness":70,"breakthroughs":55,"infrastructure":65,"talent":70},"analysis":"paragraph..."}`,
      variables: {
        name: concept.name,
        description: concept.description,
        domain: concept.domain,
        searchContext: searchContext.formattedContext,
      },
      jsonMode: true,
      maxTokens: 2048,
      temperature: 0.3,
    };
  }

  buildInvestmentPotentialPrompt(concept: Concept, searchContext: SearchContext): Prompt {
    return {
      system: `You are an investment analyst. Score 0-100 across:
- capital_efficiency (25%): Capital vs returns
- timeline (25%): Time to market/revenue
- exits (25%): Exit opportunities
- climate (25%): Investment climate for sector`,
      user: `CONCEPT: {{name}}
DESCRIPTION: {{description}}
DOMAIN: {{domain}}

RESEARCH:
{{searchContext}}

Return JSON: {"score":58,"factors":{"capital_efficiency":60,"timeline":55,"exits":50,"climate":65},"analysis":"paragraph..."}`,
      variables: {
        name: concept.name,
        description: concept.description,
        domain: concept.domain,
        searchContext: searchContext.formattedContext,
      },
      jsonMode: true,
      maxTokens: 2048,
      temperature: 0.3,
    };
  }

  buildReportPrompt(concept: Concept, scores: unknown): Prompt {
    return {
      system: `You are a senior analyst writing an executive summary. Synthesize scores into a clear, actionable report.`,
      user: `CONCEPT: {{name}}
DESCRIPTION: {{description}}

SCORES:
{{scores}}

Return JSON: {"executiveSummary":"3-5 sentences","keyRisks":["r1","r2","r3"],"recommendedNextSteps":["s1","s2","s3"]}`,
      variables: {
        name: concept.name,
        description: concept.description,
        scores: JSON.stringify(scores, null, 2),
      },
      jsonMode: true,
      maxTokens: 2048,
      temperature: 0.4,
    };
  }
}
