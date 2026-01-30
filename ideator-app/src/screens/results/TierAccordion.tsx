import type { AnalysisResult, ValidityTier } from '@/types/analysis.ts'
import Accordion from '@/components/composites/Accordion.tsx'
import Badge from '@/components/ui/Badge.tsx'
import { tierLabel } from '@/services/validity-scorer.ts'
import ResultCard from './ResultCard.tsx'

interface TierAccordionProps {
  tier: ValidityTier
  results: AnalysisResult[]
  conceptNames: Record<string, string>
  onResultClick: (id: string) => void
}

export default function TierAccordion({
  tier,
  results,
  conceptNames,
  onResultClick,
}: TierAccordionProps) {
  const label = tierLabel(tier)

  return (
    <Accordion
      title={
        <div className="flex items-center gap-3">
          <span
            className="font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </span>
          <Badge variant="cyan">{results.length}</Badge>
        </div>
      }
      defaultOpen={tier === 'T1'}
    >
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
            conceptName={conceptNames[result.conceptId] || 'Unknown Concept'}
            onClick={() => onResultClick(result.id)}
          />
        ))}
      </div>
    </Accordion>
  )
}
