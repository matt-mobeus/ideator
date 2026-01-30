import { useState, useMemo } from 'react'
import type { AnalysisResult, ValidityTier } from '@/types/analysis.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Badge from '@/components/ui/Badge.tsx'
import Button from '@/components/ui/Button.tsx'
import TierAccordion from './TierAccordion.tsx'
import ResultDetailPanel from './ResultDetailPanel.tsx'
import ExportModal from './ExportModal.tsx'
import { MOCK_RESULTS, MOCK_CONCEPT_NAMES } from '@/fixtures/results-mock-data.ts'

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
