// ============================================================================
// IDEATOR — Validity Scorer (BE-4.3)
// Calculates composite validity scores and tier assignments
// ============================================================================

import { ValidityTier } from '../../shared/types';
import type { DimensionScore } from '../../shared/types';

/** Input scores from the three analysis dimensions */
export interface RawScores {
  marketViability: DimensionScore;
  technicalFeasibility: DimensionScore;
  investmentPotential: DimensionScore;
}

/** Scored result with composite and tier */
export interface ScoredResult {
  compositeScore: number;
  validityTier: ValidityTier;
  marketViability: DimensionScore;
  technicalFeasibility: DimensionScore;
  investmentPotential: DimensionScore;
}

export class ValidityScorer {
  /**
   * Calculate composite score from three dimensions.
   * Equal weighting across market, technical, and investment.
   */
  score(raw: RawScores): ScoredResult {
    // TODO: Calculate composite score (average of 3 dimensions)
    // TODO: Assign tier: T1 (75-100), T2 (50-74), T3 (25-49), T4 (0-24)
    // TODO: Validate all sub-scores are in 0-100 range
    throw new Error('ValidityScorer.score not yet implemented');
  }

  /** Assign tier based on composite score */
  assignTier(compositeScore: number): ValidityTier {
    if (compositeScore >= 75) return ValidityTier.T1_HIGH;
    if (compositeScore >= 50) return ValidityTier.T2_MODERATE;
    if (compositeScore >= 25) return ValidityTier.T3_LOW;
    return ValidityTier.T4_NOT_VIABLE;
  }
}
