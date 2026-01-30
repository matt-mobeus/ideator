import type { AnalysisResult } from '@/types/analysis.ts'
import Button from '@/components/ui/Button.tsx'
import Badge from '@/components/ui/Badge.tsx'
import ProgressBar from '@/components/composites/ProgressBar.tsx'
import { scoreToGrade, tierLabel, tierColor } from '@/services/validity-scorer.ts'

interface ResultDetailPanelProps {
  result: AnalysisResult | null
  conceptName: string
  onClose: () => void
}

export default function ResultDetailPanel({ result, conceptName, onClose }: ResultDetailPanelProps) {
  if (!result) return null

  const grade = scoreToGrade(result.compositeScore)
  const label = tierLabel(result.tier)
  const color = tierColor(result.tier)

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 50,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '600px',
          maxWidth: '90vw',
          background: 'var(--bg-secondary)',
          borderLeft: `1px solid var(--border-primary)`,
          zIndex: 51,
          overflowY: 'auto',
        }}
      >
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {conceptName}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="cyan">
                  {label}
                </Badge>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              ✕
            </Button>
          </div>

          {/* Composite Score */}
          <div
            className="rounded-lg p-4"
            style={{
              background: `${color}10`,
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="text-5xl font-bold"
                style={{ color, textShadow: `0 0 12px ${color}60` }}
              >
                {result.compositeScore}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Grade: {grade}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Composite Score
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Score Breakdown
            </h3>

            {/* Market Viability */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Market Viability
                </span>
                <span className="font-bold" style={{ color: 'var(--color-cyan)' }}>
                  {result.marketViability.score}
                </span>
              </div>
              <ProgressBar value={result.marketViability.score} max={100} variant="cyan" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {result.marketViability.analysis}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.marketViability.factors).map(([key, value]) => (
                  <Badge key={key} variant="gray">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Technical Feasibility */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Technical Feasibility
                </span>
                <span className="font-bold" style={{ color: 'var(--color-green)' }}>
                  {result.technicalFeasibility.score}
                </span>
              </div>
              <ProgressBar value={result.technicalFeasibility.score} max={100} variant="green" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {result.technicalFeasibility.analysis}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.technicalFeasibility.factors).map(([key, value]) => (
                  <Badge key={key} variant="gray">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Investment Potential */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Investment Potential
                </span>
                <span className="font-bold" style={{ color: 'var(--color-purple)' }}>
                  {result.investmentPotential.score}
                </span>
              </div>
              <ProgressBar value={result.investmentPotential.score} max={100} variant="magenta" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {result.investmentPotential.analysis}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.investmentPotential.factors).map(([key, value]) => (
                  <Badge key={key} variant="gray">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Executive Summary
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {result.executiveSummary}
            </p>
          </div>

          {/* Key Risks */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Key Risks
            </h3>
            <ul className="flex flex-col gap-2">
              {result.keyRisks.map((risk, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: 'var(--color-red)' }}>⚠</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Next Steps */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recommended Next Steps
            </h3>
            <ol className="flex flex-col gap-2">
              {result.recommendedNextSteps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: 'var(--color-cyan)' }}>{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Supporting Evidence */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Supporting Evidence
            </h3>
            <div className="flex flex-col gap-2">
              {result.supportingEvidence.map((evidence, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3 text-sm"
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderLeft: '2px solid var(--color-cyan)',
                  }}
                >
                  <p style={{ color: 'var(--text-secondary)' }}>{evidence.citation}</p>
                  {evidence.sourceUrl && (
                    <a
                      href={evidence.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline"
                      style={{ color: 'var(--color-cyan)' }}
                    >
                      {evidence.sourceUrl}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Analyzed: {result.analyzedAt.toLocaleString()}
          </div>
        </div>
      </div>
    </>
  )
}
