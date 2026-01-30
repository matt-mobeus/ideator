import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'
import Card from '@/components/composites/Card.tsx'
import Badge from '@/components/ui/Badge.tsx'
import styles from './DetailPanel.module.css'

interface DetailPanelProps {
  level: number
  concept?: Concept
  analysis?: AnalysisResult
}

export default function DetailPanel({ level, concept, analysis }: DetailPanelProps) {
  if (!concept) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>
          No concept selected
        </p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Level 0: Cluster Stats Summary */}
      {level === 0 && (
        <Card>
          <h3 className={styles.cardTitle}>
            Cluster Overview
          </h3>
          <div className={styles.statsContainer}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>
                Total Concepts
              </span>
              <Badge variant="cyan">3</Badge>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Domain</span>
              <span className={styles.statValue}>
                {concept.domain}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Level 1: Full Report Summary */}
      {level === 1 && (
        <>
          <Card>
            <h3 className={styles.cardTitle}>
              {concept.name}
            </h3>
            <p className={styles.description}>
              {concept.description}
            </p>
          </Card>

          {analysis && (
            <Card>
              <h3 className={styles.cardTitle}>
                Validity Scores
              </h3>
              <div className={styles.statsContainer}>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>
                    Market Viability
                  </span>
                  <Badge variant="cyan">{analysis.marketViability.score}</Badge>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>
                    Technical Feasibility
                  </span>
                  <Badge variant="green">{analysis.technicalFeasibility.score}</Badge>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>
                    Investment Potential
                  </span>
                  <Badge variant="cyan">{analysis.investmentPotential.score}</Badge>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Level 2: Component Details */}
      {level === 2 && (
        <Card>
          <h3 className={styles.cardTitle}>
            Components & Relationships
          </h3>
          <div className={styles.componentsContainer}>
            <div>
              <p className={styles.sectionLabel}>
                Related Concepts
              </p>
              <div className={styles.badgeContainer}>
                {concept.relatedConcepts.length > 0 ? (
                  concept.relatedConcepts.map((id) => (
                    <Badge key={id} variant="cyan">
                      {id}
                    </Badge>
                  ))
                ) : (
                  <span className={styles.emptyBadge}>None</span>
                )}
              </div>
            </div>
            <div>
              <p className={styles.sectionLabel}>
                Themes
              </p>
              <div className={styles.badgeContainer}>
                {concept.themes.map((theme) => (
                  <Badge key={theme} variant="green">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Level 3: Technical Data */}
      {level === 3 && (
        <Card>
          <h3 className={styles.cardTitle}>
            Technical Specifications
          </h3>
          <div className={styles.statsContainer}>
            <div>
              <p className={styles.sectionLabel}>
                Abstraction Level
              </p>
              <Badge variant="cyan">{concept.abstractionLevel}</Badge>
            </div>
            <div>
              <p className={styles.sectionLabel}>
                Source References
              </p>
              <span className={styles.statValue}>
                {concept.sourceReferences.length} references
              </span>
            </div>
            <div>
              <p className={styles.sectionLabel}>
                Extraction Date
              </p>
              <span className={styles.statValue}>
                {concept.extractionTimestamp.toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Level 4: Source Excerpts */}
      {level === 4 && (
        <Card>
          <h3 className={styles.cardTitle}>
            Source Excerpts
          </h3>
          <div className={styles.componentsContainer}>
            {concept.sourceReferences.map((ref, idx) => (
              <div key={idx} className={styles.sourceExcerptItem}>
                <p className={styles.sourceFileName}>
                  {ref.fileName}
                </p>
                <p className={styles.sourceExcerpt}>
                  {ref.excerpt}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
