import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'
import Card from '@/components/composites/Card.tsx'
import Badge from '@/components/ui/Badge.tsx'
import styles from './MediaReactiveDisplay.module.css'

interface MediaReactiveDisplayProps {
  contentType: 'concept' | 'visualization' | 'analysis' | 'source' | 'asset'
  concept?: Concept
  analysis?: AnalysisResult
}

export default function MediaReactiveDisplay({
  contentType,
  concept,
  analysis,
}: MediaReactiveDisplayProps) {
  // Concept display
  if (contentType === 'concept' && concept) {
    return (
      <div className={styles.scrollContainer}>
        <Card>
          <h2 className={styles.heading}>
            {concept.name}
          </h2>
          <div className={styles.badgeRow}>
            <Badge variant="cyan">{concept.domain}</Badge>
            <Badge variant="green">{concept.abstractionLevel}</Badge>
          </div>
          <p className={styles.description}>
            {concept.description}
          </p>
        </Card>

        <Card>
          <h3 className={styles.sectionTitle}>
            Related Concepts
          </h3>
          {concept.relatedConcepts.length > 0 ? (
            <div className={styles.badgeContainer}>
              {concept.relatedConcepts.map((id) => (
                <Badge key={id} variant="cyan">
                  {id}
                </Badge>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>
              No related concepts
            </p>
          )}
        </Card>
      </div>
    )
  }

  // Visualization display
  if (contentType === 'visualization') {
    return (
      <div className={styles.centerContainer}>
        <Card className={styles.placeholderCard}>
          <p className={styles.placeholderText}>
            Visualization canvas placeholder
          </p>
        </Card>
      </div>
    )
  }

  // Analysis display
  if (contentType === 'analysis' && analysis) {
    return (
      <div className={styles.scrollContainer}>
        <Card>
          <h3 className={styles.reportHeading}>
            Analysis Report
          </h3>
          <div className={styles.reportBadgeRow}>
            <Badge variant="cyan">Score: {analysis.compositeScore}</Badge>
            <Badge variant="green">{analysis.tier}</Badge>
          </div>
          <p className={styles.reportDescription}>
            {analysis.executiveSummary}
          </p>
        </Card>

        <Card>
          <h4 className={styles.metricsTitle}>
            Key Metrics
          </h4>
          <div className={styles.metricsContainer}>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>
                Market Viability
              </span>
              <Badge variant="cyan">{analysis.marketViability.score}</Badge>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>
                Technical Feasibility
              </span>
              <Badge variant="green">{analysis.technicalFeasibility.score}</Badge>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>
                Investment Potential
              </span>
              <Badge variant="cyan">{analysis.investmentPotential.score}</Badge>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Source document display
  if (contentType === 'source') {
    return (
      <div className={styles.centerContainer} style={{ background: 'var(--bg-primary)' }}>
        <Card className={styles.placeholderCard}>
          <p className={styles.placeholderText}>
            Document viewer placeholder
          </p>
        </Card>
      </div>
    )
  }

  // Asset display
  if (contentType === 'asset') {
    return (
      <div className={styles.assetContainer}>
        <Card className={styles.placeholderCard}>
          <h3 className={styles.assetPreviewTitle}>
            Asset Preview
          </h3>
          <p className={styles.placeholderText}>
            Preview placeholder
          </p>
        </Card>
        <Card className={styles.placeholderCard}>
          <h4 className={styles.assetProvenanceTitle}>
            Provenance
          </h4>
          <p className={styles.assetProvenanceText}>
            No provenance data available
          </p>
        </Card>
      </div>
    )
  }

  return null
}
