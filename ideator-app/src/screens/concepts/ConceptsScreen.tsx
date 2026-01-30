import { useState, useMemo } from 'react'
import type { Concept, Cluster } from '@/types/concept.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Badge from '@/components/ui/Badge.tsx'
import FilterPanel from './FilterPanel.tsx'
import ClusterContainer from './ClusterContainer.tsx'
import { MOCK_CONCEPTS, MOCK_CLUSTERS } from '@/fixtures/concepts-mock-data.ts'

// ── Helpers ───────────────────────────────────────────────────────────

function unique(arr: string[]): string[] {
  return [...new Set(arr)]
}

// ── Screen ────────────────────────────────────────────────────────────

export default function ConceptsScreen() {
  const [useMock] = useState(true)

  const concepts: Concept[] = useMock ? MOCK_CONCEPTS : []
  const clusters: Cluster[] = useMock ? MOCK_CLUSTERS : []

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
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Concepts
        </h1>
        <Badge variant="cyan">{filtered.length}</Badge>
      </div>

      {/* Body */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar — hidden on small screens */}
        <div className="hidden w-64 shrink-0 overflow-y-auto md:block">
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
        </div>

        {/* Main content */}
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
      </div>
    </div>
  )
}
