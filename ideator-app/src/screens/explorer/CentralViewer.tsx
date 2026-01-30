import { useState } from 'react'
import type { VisualizationData, TimelineNode, NodeMapNode } from '@/types/visualization.ts'
import { BranchingTree } from '@/visualizations/BranchingTree.tsx'
import { NodeMap } from '@/visualizations/NodeMap.tsx'
import { ZoomControls } from '@/visualizations/shared/zoom-controls.tsx'
import Button from '@/components/ui/Button.tsx'
import Icon from '@/components/ui/Icon.tsx'
import styles from './CentralViewer.module.css'

interface CentralViewerProps {
  viewMode: 'tree' | 'map'
  visualizationData: VisualizationData
  onNodeSelect?: (node: TimelineNode | NodeMapNode) => void
  onViewModeChange?: (mode: 'tree' | 'map') => void
}

export default function CentralViewer({
  viewMode,
  visualizationData,
  onNodeSelect,
  onViewModeChange,
}: CentralViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={styles.container}>
      {/* View Mode Toggle */}
      <div className={styles.viewModeToggle}>
        <Button
          variant={viewMode === 'tree' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onViewModeChange?.('tree')}
        >
          <Icon name="tree" />
          Tree
        </Button>
        <Button
          variant={viewMode === 'map' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onViewModeChange?.('map')}
        >
          <Icon name="network" />
          Map
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className={styles.zoomControls}>
        <ZoomControls
          onZoomIn={() => {/* Zoom in */}}
          onZoomOut={() => {/* Zoom out */}}
          onReset={() => {/* Reset zoom */}}
          onFullscreen={toggleFullscreen}
        />
      </div>

      {/* Fullscreen Toggle */}
      <div className={styles.fullscreenToggle}>
        <Button variant="secondary" size="sm" onClick={toggleFullscreen}>
          <Icon name={isFullscreen ? 'minimize' : 'maximize'} />
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>

      {/* Visualization Canvas */}
      <div className={styles.canvas}>
        {viewMode === 'tree' ? (
          <BranchingTree
            data={{
              nodes: visualizationData.timelineNodes,
              edges: visualizationData.timelineEdges,
            }}
            onNodeSelect={onNodeSelect}
          />
        ) : (
          <NodeMap
            data={{
              nodes: visualizationData.nodeMapNodes,
              edges: visualizationData.nodeMapEdges,
            }}
            onNodeSelect={onNodeSelect}
          />
        )}
      </div>
    </div>
  )
}
