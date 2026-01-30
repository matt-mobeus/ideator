import type { ValidityTier } from '@/types/analysis.ts'

export function calculateCompositeScore(market: number, technical: number, investment: number): number {
  return Math.round(market * 0.4 + technical * 0.35 + investment * 0.25)
}

export function scoreToGrade(score: number): string {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 87) return 'B+'
  if (score >= 80) return 'B'
  if (score >= 73) return 'C+'
  if (score >= 65) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

export function tierLabel(tier: ValidityTier): string {
  const labels: Record<ValidityTier, string> = {
    T1: 'Tier 1 — Highly Viable',
    T2: 'Tier 2 — Promising',
    T3: 'Tier 3 — Needs Development',
    T4: 'Tier 4 — High Risk',
  }
  return labels[tier]
}

export function tierColor(tier: ValidityTier): string {
  const colors: Record<ValidityTier, string> = {
    T1: 'var(--tier-t1)',
    T2: 'var(--tier-t2)',
    T3: 'var(--tier-t3)',
    T4: 'var(--tier-t4)',
  }
  return colors[tier]
}
