import { useState, useMemo } from 'react'
import type { AnalysisResult, ValidityTier } from '@/types/analysis.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Badge from '@/components/ui/Badge.tsx'
import Button from '@/components/ui/Button.tsx'
import TierAccordion from './TierAccordion.tsx'
import ResultDetailPanel from './ResultDetailPanel.tsx'
import ExportModal from './ExportModal.tsx'

// ── Mock data for visual testing ──────────────────────────────────────

const MOCK_RESULTS: AnalysisResult[] = [
  {
    id: 'r1',
    conceptId: 'c1',
    compositeScore: 87,
    tier: 'T1',
    marketViability: {
      score: 92,
      factors: { demand: 95, competition: 88, timing: 93 },
      analysis: 'Strong market demand with clear differentiation opportunities. Timing is excellent given recent industry shifts.',
    },
    technicalFeasibility: {
      score: 85,
      factors: { complexity: 80, resources: 88, timeline: 87 },
      analysis: 'Technically achievable with existing tools and frameworks. Some challenges in scaling but manageable.',
    },
    investmentPotential: {
      score: 84,
      factors: { roi: 86, risk: 82, growth: 85 },
      analysis: 'Attractive investment profile with reasonable risk-adjusted returns. Clear path to revenue.',
    },
    executiveSummary: 'This concept demonstrates exceptional market fit with strong technical fundamentals. The combination of high market demand, proven technical approaches, and clear monetization paths makes this a highly viable opportunity.',
    keyRisks: [
      'Competitive landscape may shift rapidly',
      'Technical complexity could increase development timeline',
      'Regulatory considerations need deeper analysis',
    ],
    recommendedNextSteps: [
      'Conduct detailed competitive analysis',
      'Build proof-of-concept prototype',
      'Validate pricing model with target customers',
      'Secure initial funding round',
    ],
    supportingEvidence: [
      {
        citation: 'Market research indicates 40% YoY growth in this sector',
        sourceUrl: 'https://example.com/market-report',
      },
      {
        citation: 'Similar technical implementations have proven successful at scale',
      },
    ],
    analyzedAt: new Date('2025-01-28T10:30:00'),
  },
  {
    id: 'r2',
    conceptId: 'c2',
    compositeScore: 68,
    tier: 'T2',
    marketViability: {
      score: 72,
      factors: { demand: 75, competition: 68, timing: 73 },
      analysis: 'Moderate market demand with some competitive pressure. Timing is acceptable but not optimal.',
    },
    technicalFeasibility: {
      score: 67,
      factors: { complexity: 65, resources: 70, timeline: 66 },
      analysis: 'Feasible but requires significant development effort. Some technical unknowns to resolve.',
    },
    investmentPotential: {
      score: 64,
      factors: { roi: 66, risk: 62, growth: 65 },
      analysis: 'Moderate investment potential with average risk profile. Revenue model needs refinement.',
    },
    executiveSummary: 'A promising concept with solid fundamentals but requiring additional development. Market opportunity exists but competitive positioning needs strengthening. Technical approach is sound with manageable complexity.',
    keyRisks: [
      'Market adoption may be slower than projected',
      'Resource requirements could exceed initial estimates',
      'Monetization strategy needs validation',
    ],
    recommendedNextSteps: [
      'Refine value proposition',
      'Conduct technical feasibility study',
      'Test minimum viable product with early adopters',
    ],
    supportingEvidence: [
      {
        citation: 'Industry trends support gradual adoption of similar solutions',
      },
    ],
    analyzedAt: new Date('2025-01-28T11:15:00'),
  },
  {
    id: 'r3',
    conceptId: 'c3',
    compositeScore: 42,
    tier: 'T3',
    marketViability: {
      score: 48,
      factors: { demand: 50, competition: 45, timing: 49 },
      analysis: 'Limited market demand with unclear timing. Competitive landscape is challenging.',
    },
    technicalFeasibility: {
      score: 38,
      factors: { complexity: 35, resources: 40, timeline: 39 },
      analysis: 'Significant technical challenges with high complexity. Resource requirements are substantial.',
    },
    investmentPotential: {
      score: 40,
      factors: { roi: 42, risk: 38, growth: 41 },
      analysis: 'High-risk investment profile with uncertain returns. Growth path is not clearly defined.',
    },
    executiveSummary: 'This concept requires substantial development before viability can be established. Both market and technical aspects need significant work. Consider pivoting or combining with complementary concepts.',
    keyRisks: [
      'Market fit is not validated',
      'Technical approach may not be feasible at scale',
      'Investment requirements likely exceed potential returns',
      'Timeline to market is unclear',
    ],
    recommendedNextSteps: [
      'Re-evaluate core value proposition',
      'Explore alternative technical approaches',
      'Consider strategic partnerships to reduce risk',
    ],
    supportingEvidence: [
      {
        citation: 'Similar concepts have faced adoption challenges in the past',
      },
    ],
    analyzedAt: new Date('2025-01-28T12:00:00'),
  },
  {
    id: 'r4',
    conceptId: 'c4',
    compositeScore: 18,
    tier: 'T4',
    marketViability: {
      score: 22,
      factors: { demand: 20, competition: 25, timing: 21 },
      analysis: 'Very limited market demand with poor timing. Highly competitive environment.',
    },
    technicalFeasibility: {
      score: 15,
      factors: { complexity: 12, resources: 18, timeline: 15 },
      analysis: 'Extreme technical complexity with unclear path to implementation. Resource requirements are prohibitive.',
    },
    investmentPotential: {
      score: 17,
      factors: { roi: 15, risk: 20, growth: 16 },
      analysis: 'Very high risk with minimal expected returns. No clear revenue model.',
    },
    executiveSummary: 'This concept faces fundamental challenges across all dimensions. Market demand is insufficient, technical implementation is highly uncertain, and investment risk is extreme. Not recommended for pursuit without major reconceptualization.',
    keyRisks: [
      'No validated market need',
      'Technical feasibility is questionable',
      'Resource requirements far exceed potential value',
      'Competitive alternatives already exist',
      'Regulatory barriers may be insurmountable',
    ],
    recommendedNextSteps: [
      'Shelve concept pending major market or technical shifts',
      'Explore completely different approaches',
      'Consider salvaging specific sub-components for other projects',
    ],
    supportingEvidence: [
      {
        citation: 'Multiple failed attempts at similar implementations documented',
      },
    ],
    analyzedAt: new Date('2025-01-28T13:30:00'),
  },
]

const MOCK_CONCEPT_NAMES: Record<string, string> = {
  c1: 'Neural Style Transfer',
  c2: 'Attention Mechanisms',
  c3: 'Quantum Computing Integration',
  c4: 'Blockchain-based Neural Networks',
}

// ── Helpers ───────────────────────────────────────────────────────────

function groupByTier(results: AnalysisResult[]): Record<ValidityTier, AnalysisResult[]> {
  const groups: Record<ValidityTier, AnalysisResult[]> = {
    T1: [],
    T2: [],
    T3: [],
    T4: [],
  }
  results.forEach((r) => groups[r.tier].push(r))
  return groups
}

// ── Screen ────────────────────────────────────────────────────────────

export default function ResultsScreen() {
  const [useMock] = useState(true)

  const results: AnalysisResult[] = useMock ? MOCK_RESULTS : []
  const conceptNames: Record<string, string> = useMock ? MOCK_CONCEPT_NAMES : {}

  const [selectedResultId, setSelectedResultId] = useState<string | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const selectedResult = useMemo(
    () => results.find((r) => r.id === selectedResultId) || null,
    [results, selectedResultId]
  )

  const groupedResults = useMemo(() => groupByTier(results), [results])

  if (results.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title="No results yet"
          description="Run validity analysis on concepts to see results here."
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Results
          </h1>
          <Badge variant="cyan">{results.length}</Badge>
        </div>
        <Button onClick={() => setIsExportOpen(true)} variant="primary">
          Export
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {(['T1', 'T2', 'T3', 'T4'] as ValidityTier[]).map((tier) => {
          const tierResults = groupedResults[tier]
          if (tierResults.length === 0) return null
          return (
            <TierAccordion
              key={tier}
              tier={tier}
              results={tierResults}
              conceptNames={conceptNames}
              onResultClick={setSelectedResultId}
            />
          )
        })}
      </div>

      {/* Detail Panel */}
      <ResultDetailPanel
        result={selectedResult}
        conceptName={selectedResult ? conceptNames[selectedResult.conceptId] || 'Unknown Concept' : ''}
        onClose={() => setSelectedResultId(null)}
      />

      {/* Export Modal */}
      <ExportModal
        results={results}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  )
}
