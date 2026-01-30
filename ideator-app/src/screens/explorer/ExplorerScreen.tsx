import { useState } from 'react'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Breadcrumb from '@/components/composites/Breadcrumb.tsx'
import DrillNavigation from './DrillNavigation.tsx'
import CentralViewer from './CentralViewer.tsx'
import DetailPanel from './DetailPanel.tsx'
import SourceExcerptsStrip from './SourceExcerptsStrip.tsx'
import { MOCK_CONCEPT, MOCK_ANALYSIS, MOCK_VISUALIZATION } from '@/fixtures/explorer-mock-data.ts'
import styles from './ExplorerScreen.module.css'

const LEVEL_LABELS = ['L0: Cluster', 'L1: Overview', 'L2: Components', 'L3: Technical', 'L4: Sources']

// ── Screen ────────────────────────────────────────────────────────────

export default function ExplorerScreen() {
  const [useMock] = useState(true)

  const concept = useMock ? MOCK_CONCEPT : undefined
  const analysis = useMock ? MOCK_ANALYSIS : undefined
  const visualizationData = useMock ? MOCK_VISUALIZATION : undefined

  const [level, setLevel] = useState(0)
  const [viewMode, setViewMode] = useState<'tree' | 'map'>('tree')

  if (!concept) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title="Concept not found"
          description="The requested concept does not exist."
        />
      </div>
    )
  }

  const excerpts = concept.sourceReferences.map((ref) => ({
    fileId: ref.fileId,
    fileName: ref.fileName,
    excerpt: ref.excerpt,
  }))

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb */}
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb
          items={[
            { label: 'Concepts' },
            { label: concept.name },
            { label: 'Explore' },
          ]}
        />
      </div>

      {/* Drill Navigation */}
      <DrillNavigation level={level} levelLabels={LEVEL_LABELS} onLevelChange={setLevel} />

      {/* Main Content: Central Viewer + Detail Panel */}
      <div className={styles.mainContent}>
        {visualizationData && (
          <CentralViewer
            viewMode={viewMode}
            visualizationData={visualizationData}
            onNodeSelect={() => {}}
            onViewModeChange={setViewMode}
          />
        )}
        <DetailPanel level={level} concept={concept} analysis={analysis} />
      </div>

      {/* Source Excerpts Strip */}
      <SourceExcerptsStrip
        excerpts={excerpts}
        onExcerptClick={() => {/* Excerpt clicked */}}
      />
    </div>
  )
}
