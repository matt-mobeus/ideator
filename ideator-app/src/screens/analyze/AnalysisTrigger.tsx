import type { AnalysisResult } from '@/types/analysis.ts'
import type { Job } from '@/types/queue.ts'
import Card from '@/components/composites/Card.tsx'
import ProgressBar from '@/components/composites/ProgressBar.tsx'
import Button from '@/components/ui/Button.tsx'
import Badge from '@/components/ui/Badge.tsx'

interface AnalysisTriggerProps {
  conceptId: string
  existingAnalysis?: AnalysisResult
  currentJob?: Job
}

export default function AnalysisTrigger({
  conceptId: _conceptId,
  existingAnalysis,
  currentJob,
}: AnalysisTriggerProps) {
  const handleAnalyze = () => {
    // TODO(#backlog): Integrate jobQueueService.enqueue('market_analysis', conceptId) when queue service is available
  }

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Market Analysis
        </h3>

        {currentJob && currentJob.status === 'running' ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {currentJob.progressLabel || 'Analyzing...'}
            </span>
            <ProgressBar value={currentJob.progress} />
          </div>
        ) : existingAnalysis ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Composite Score:
              </span>
              <span className="text-2xl font-bold" style={{ color: 'var(--accent-cyan)' }}>
                {existingAnalysis.compositeScore}
              </span>
              <Badge variant="cyan">{existingAnalysis.tier}</Badge>
            </div>
            <Button
              onClick={handleAnalyze}
              variant="secondary"
              style={{
                borderColor: 'var(--accent-cyan)',
                color: 'var(--accent-cyan)',
              }}
            >
              Re-analyze
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Run a comprehensive market viability analysis for this concept.
            </p>
            <Button
              onClick={handleAnalyze}
              style={{
                background: 'var(--accent-cyan)',
                color: 'var(--bg-primary)',
                boxShadow: 'var(--glow-cyan-md)',
              }}
            >
              Analyze Market Viability
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
