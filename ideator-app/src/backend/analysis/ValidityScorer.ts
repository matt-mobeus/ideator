// ============================================================================
// IDEATOR — Validity Scorer (BE-4.3)
// Calculates composite validity scores and tier assignments
// ============================================================================

import { ValidityTier } from '../../shared/types';
import type { DimensionScore } from '../../shared/types';

export interface RawScores {
  marketViability: DimensionScore;
  technicalFeasibility: DimensionScore;
  investmentPotential: DimensionScore;
}

export interface ScoredResult {
  compositeScore: number;
  validityTier: ValidityTier;
  marketViability: DimensionScore;
  technicalFeasibility: DimensionScore;
  investmentPotential: DimensionScore;
}

export class ValidityScorer {
  score(raw: RawScores): ScoredResult {
    const clamp = (n: number) => Math.max(0, Math.min(100, n));

    const market = { ...raw.marketViability, score: clamp(raw.marketViability.score) };
    const tech = { ...raw.technicalFeasibility, score: clamp(raw.technicalFeasibility.score) };
    const invest = { ...raw.investmentPotential, score: clamp(raw.investmentPotential.score) };

    const compositeScore = Math.round(
      (market.score + tech.score + invest.score) / 3
    );

    return {
      compositeScore,
      validityTier: this.assignTier(compositeScore),
      marketViability: market,
      technicalFeasibility: tech,
      investmentPotential: invest,
    };
  }

  assignTier(compositeScore: number): ValidityTier {
    if (compositeScore >= 75) return ValidityTier.T1_HIGH;
    if (compositeScore >= 50) return ValidityTier.T2_MODERATE;
    if (compositeScore >= 25) return ValidityTier.T3_LOW;
    return ValidityTier.T4_NOT_VIABLE;
  }
}
