// ============================================================================
// IDEATOR — Analysis Processor (BE-4.2)
// Executes the full market analysis workflow for a concept
// ============================================================================

import type { Concept, AnalysisResult, DimensionScore } from '../../shared/types';
import { AnalysisPhase } from '../../shared/types';
import { PromptService } from '../../network/search/PromptService';
import { SearchQueryBuilder } from '../../network/search/SearchQueryBuilder';
import { SearchAggregator } from '../../network/search/SearchAggregator';
import { AnalysisPromptBuilder } from './AnalysisPromptBuilder';
import { ValidityScorer } from './ValidityScorer';
import { generateId } from '../../shared/utils';

export type AnalysisProgressCallback = (phase: string, progress: number) => void;

export class AnalysisProcessor {
  private promptService: PromptService;
  private queryBuilder: SearchQueryBuilder;
  private aggregator: SearchAggregator;
  private analysisPromptBuilder: AnalysisPromptBuilder;
  private scorer: ValidityScorer;

  constructor(
    promptService: PromptService,
    aggregator: SearchAggregator
  ) {
    this.promptService = promptService;
    this.queryBuilder = new SearchQueryBuilder();
    this.aggregator = aggregator;
    this.analysisPromptBuilder = new AnalysisPromptBuilder();
    this.scorer = new ValidityScorer();
  }

  async analyze(
    concept: Concept,
    onProgress?: AnalysisProgressCallback
  ): Promise<AnalysisResult> {
    // Phase 1: Search
    onProgress?.(AnalysisPhase.SEARCHING_TRENDS, 10);
    const queries = this.queryBuilder.buildQueries(concept.name, concept.domain);
    const searchContext = await this.aggregator.aggregate(queries);

    // Phase 2: Market viability
    onProgress?.(AnalysisPhase.ANALYZING_FEASIBILITY, 30);
    const marketPrompt = this.analysisPromptBuilder.buildMarketViabilityPrompt(concept, searchContext);
    const marketResponse = await this.promptService.executeWithRetry(marketPrompt);
    const marketViability = PromptService.extractJSON<DimensionScore>(marketResponse);

    // Phase 3: Technical feasibility
    const techPrompt = this.analysisPromptBuilder.buildTechnicalFeasibilityPrompt(concept, searchContext);
    const techResponse = await this.promptService.executeWithRetry(techPrompt);
    const technicalFeasibility = PromptService.extractJSON<DimensionScore>(techResponse);

    // Phase 4: Investment potential
    onProgress?.(AnalysisPhase.EVALUATING_INVESTMENT, 60);
    const investPrompt = this.analysisPromptBuilder.buildInvestmentPotentialPrompt(concept, searchContext);
    const investResponse = await this.promptService.executeWithRetry(investPrompt);
    const investmentPotential = PromptService.extractJSON<DimensionScore>(investResponse);

    // Phase 5: Score and report
    onProgress?.(AnalysisPhase.COMPILING_REPORT, 80);
    const scored = this.scorer.score({
      marketViability,
      technicalFeasibility,
      investmentPotential,
    });

    const reportPrompt = this.analysisPromptBuilder.buildReportPrompt(concept, scored);
    const reportResponse = await this.promptService.executeWithRetry(reportPrompt);
    const report = PromptService.extractJSON<{
      executiveSummary: string;
      keyRisks: string[];
      recommendedNextSteps: string[];
    }>(reportResponse);

    // Build citations from search sources
    const evidenceCitations = searchContext.sources.slice(0, 10).map((s) => ({
      statement: s.snippet.slice(0, 200),
      sourceUrl: s.url,
      sourceTitle: s.title,
      snippet: s.snippet,
      publishedDate: s.publishedDate,
    }));

    return {
      id: generateId(),
      conceptId: concept.id,
      validityTier: scored.validityTier,
      compositeScore: scored.compositeScore,
      marketViability: scored.marketViability,
      technicalFeasibility: scored.technicalFeasibility,
      investmentPotential: scored.investmentPotential,
      qualitativeReport: {
        executiveSummary: report.executiveSummary ?? '',
        keyRisks: report.keyRisks ?? [],
        recommendedNextSteps: report.recommendedNextSteps ?? [],
      },
      evidenceCitations,
      analyzedTimestamp: new Date(),
    };
  }
}
