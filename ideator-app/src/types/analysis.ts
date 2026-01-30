export type ValidityTier = 'T1' | 'T2' | 'T3' | 'T4'

export interface SubScore {
  score: number
  factors: Record<string, number>
  analysis: string
}

export interface AnalysisResult {
  id: string
  conceptId: string
  compositeScore: number
  tier: ValidityTier
  marketViability: SubScore
  technicalFeasibility: SubScore
  investmentPotential: SubScore
  executiveSummary: string
  keyRisks: string[]
  recommendedNextSteps: string[]
  supportingEvidence: { citation: string; sourceUrl?: string }[]
  analyzedAt: Date
}

export function tierFromScore(score: number): ValidityTier {
  if (score >= 75) return 'T1'
  if (score >= 50) return 'T2'
  if (score >= 25) return 'T3'
  return 'T4'
}
