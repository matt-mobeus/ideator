import type { AnalysisResult } from '@/types/analysis.ts'
import Card from '@/components/composites/Card.tsx'
import Badge from '@/components/ui/Badge.tsx'
import ProgressBar from '@/components/composites/ProgressBar.tsx'
import { scoreToGrade, tierColor } from '@/services/validity-scorer.ts'

interface ResultCardProps {
  result: AnalysisResult
  conceptName: string
  onClick: () => void
}

export default function ResultCard({ result, conceptName, onClick }: ResultCardProps) {
  const grade = scoreToGrade(result.compositeScore)
  const color = tierColor(result.tier)


  return (
    <Card
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderLeft: `3px solid ${color}`,
        transition: 'all var(--duration-normal) var(--ease-default)',
      }}
      className="hover:shadow-lg"
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {conceptName}
            </h3>
          </div>
          <Badge variant="cyan">
            {result.tier}
          </Badge>
        </div>

        {/* Composite Score */}
        <div className="flex items-center gap-3">
          <div
            className="text-3xl font-bold"
            style={{ color, textShadow: `0 0 8px ${color}40` }}
          >
            {result.compositeScore}
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-secondary)' }}
          >
            {grade}
          </div>
        </div>

        {/* Executive Summary */}
        <p
          className="text-sm leading-relaxed"
          style={{
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {result.executiveSummary}
        </p>

        {/* Mini Score Bars */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-20 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Market
            </span>
            <div className="flex-1">
              <ProgressBar value={result.marketViability.score} max={100} variant="cyan" />
            </div>
            <span className="w-8 text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
              {result.marketViability.score}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Technical
            </span>
            <div className="flex-1">
              <ProgressBar value={result.technicalFeasibility.score} max={100} variant="green" />
            </div>
            <span className="w-8 text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
              {result.technicalFeasibility.score}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Investment
            </span>
            <div className="flex-1">
              <ProgressBar value={result.investmentPotential.score} max={100} variant="magenta" />
            </div>
            <span className="w-8 text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
              {result.investmentPotential.score}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
