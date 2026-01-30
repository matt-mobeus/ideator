import Card from '@/components/composites/Card.tsx'
import EmptyState from '@/components/composites/EmptyState.tsx'
import styles from './SourceExcerptsStrip.module.css'

interface SourceExcerptsStripProps {
  excerpts: { fileId: string; fileName: string; excerpt: string }[]
  onExcerptClick?: (fileId: string) => void
}

export default function SourceExcerptsStrip({
  excerpts,
  onExcerptClick,
}: SourceExcerptsStripProps) {
  if (excerpts.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState
          title="No source excerpts"
          description="Source references will appear here."
        />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        {excerpts.map((excerpt) => (
          <Card
            key={excerpt.fileId}
            onClick={() => onExcerptClick?.(excerpt.fileId)}
            className={`${styles.excerptCard} ${onExcerptClick ? styles.excerptCardClickable : ''}`}
          >
            <h4 className={styles.fileName}>
              {excerpt.fileName}
            </h4>
            <p className={styles.excerpt}>
              {excerpt.excerpt}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
