import { useState, useMemo, useEffect } from 'react'
import type { Concept, Cluster } from '@/types/concept.ts'
import { pipelineStore } from '@/services/pipeline/store.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Badge from '@/components/ui/Badge.tsx'
import { PageHeader, SplitPanel } from '@/components/global'
import FilterPanel from './FilterPanel.tsx'
import ClusterContainer from './ClusterContainer.tsx'
import { MOCK_CONCEPTS, MOCK_CLUSTERS } from '@/fixtures/concepts-mock-data.ts'

// ── Helpers ───────────────────────────────────────────────────────────

function unique(arr: string[]): string[] {
  return [...new Set(arr)]
}

// ── Screen ────────────────────────────────────────────────────────────

export default function ConceptsScreen() {
  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [pipelineConcepts, setPipelineConcepts] = useState<Concept[] | null>(null)

  useEffect(() => {
    const pipelineId = sessionStorage.getItem('active-pipeline-id')
    if (!pipelineId) return

    let cancelled = false

    const pollPipeline = async () => {
      try {
        const plan = await pipelineStore.load(pipelineId)
        if (cancelled || !plan) return

        const conceptTask = Object.values(plan.tasks).find(t => t.type === 'concept-extraction')
        if (!conceptTask) return

        if (conceptTask.status === 'completed' && conceptTask.output && 'concepts' in conceptTask.output) {
          setPipelineConcepts(conceptTask.output.concepts)
          setPipelineState('done')
          return
        }

        if (conceptTask.status === 'failed') {
          setPipelineState('error')
          return
        }

        setPipelineState('running')
        setTimeout(pollPipeline, 2000)
      } catch {
        setPipelineState('error')
      }
    }

    pollPipeline()
    return () => { cancelled = true }
  }, [])

  const concepts: Concept[] = pipelineConcepts ?? MOCK_CONCEPTS
  const clusters: Cluster[] = pipelineConcepts ? [] : MOCK_CLUSTERS

  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])

  const allDomains = useMemo(() => unique(concepts.map((c) => c.domain)), [concepts])
  const allThemes = useMemo(() => unique(concepts.flatMap((c) => c.themes)), [concepts])
  const allLevels = useMemo(() => unique(concepts.map((c) => c.abstractionLevel)), [concepts])

  const filtered = useMemo(() => {
    return concepts.filter((c) => {
      if (selectedDomains.length > 0 && !selectedDomains.includes(c.domain)) return false
      if (selectedThemes.length > 0 && !c.themes.some((t) => selectedThemes.includes(t))) return false
      if (selectedLevels.length > 0 && !selectedLevels.includes(c.abstractionLevel)) return false
      return true
    })
  }, [concepts, selectedDomains, selectedThemes, selectedLevels])

  const clearFilters = () => {
    setSelectedDomains([])
    setSelectedThemes([])
    setSelectedLevels([])
  }

  if (concepts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title="No concepts yet"
          description="Upload documents and run analysis to extract concepts."
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Concepts"
        actions={<Badge variant="cyan">{filtered.length}</Badge>}
      />

      {pipelineState === 'running' && (
        <div className="mx-4 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          Pipeline running — concepts will appear when extraction completes.
        </div>
      )}
      {pipelineState === 'error' && (
        <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Pipeline encountered an error. Showing sample data.
        </div>
      )}

      <SplitPanel
        sidebar={
          <FilterPanel
            domains={allDomains}
            themes={allThemes}
            levels={allLevels}
            selectedDomains={selectedDomains}
            selectedThemes={selectedThemes}
            selectedLevels={selectedLevels}
            onDomainsChange={setSelectedDomains}
            onThemesChange={setSelectedThemes}
            onLevelsChange={setSelectedLevels}
            onClear={clearFilters}
          />
        }
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState title="No matching concepts" description="Try adjusting your filters." />
          ) : (
            clusters
              .map((cluster) => {
                const clusterConcepts = filtered.filter((c) => c.clusterId === cluster.id)
                if (clusterConcepts.length === 0) return null
                return (
                  <ClusterContainer
                    key={cluster.id}
                    cluster={cluster}
                    concepts={clusterConcepts}
                  />
                )
              })
              .filter(Boolean)
          )}
        </div>
      </SplitPanel>
    </div>
  )
}
