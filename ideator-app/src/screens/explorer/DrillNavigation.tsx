import Breadcrumb from '@/components/composites/Breadcrumb.tsx'
import Button from '@/components/ui/Button.tsx'
import Badge from '@/components/ui/Badge.tsx'
import styles from './DrillNavigation.module.css'

interface DrillNavigationProps {
  level: number
  levelLabels: string[]
  onLevelChange: (level: number) => void
}

const DRILL_BUTTON_LABELS: Record<number, string> = {
  0: 'View Details',
  1: 'View Components',
  2: 'Technical Specs',
  3: 'View Source',
}

export default function DrillNavigation({ level, levelLabels, onLevelChange }: DrillNavigationProps) {
  const breadcrumbItems = levelLabels.slice(0, level + 1).map((label, idx) => ({
    label,
    onClick: () => onLevelChange(idx),
  }))

  const canDrillDown = level < levelLabels.length - 1
  const canGoBack = level > 0

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbWrapper}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Level Badge */}
      <Badge variant="cyan">L{level}</Badge>

      {/* Back Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onLevelChange(level - 1)}
        disabled={!canGoBack}
      >
        ← Back
      </Button>

      {/* Drill Down Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={() => onLevelChange(level + 1)}
        disabled={!canDrillDown}
      >
        {DRILL_BUTTON_LABELS[level] || 'Drill Down'} →
      </Button>
    </div>
  )
}
