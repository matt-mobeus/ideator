import { useState, useMemo } from 'react'
import type { Concept, Cluster } from '@/types/concept.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Badge from '@/components/ui/Badge.tsx'
import FilterPanel from './FilterPanel.tsx'
import ClusterContainer from './ClusterContainer.tsx'

// ── Mock data for visual testing ──────────────────────────────────────

const MOCK_CONCEPTS: Concept[] = [
  {
    id: 'c1',
    name: 'Neural Style Transfer',
    description:
      'A technique using deep neural networks to apply the artistic style of one image to another, enabling novel visual transformations while preserving content structure.',
    abstractionLevel: 'L1_SPECIFIC',
    domain: 'Computer Vision',
    themes: ['Deep Learning', 'Generative'],
    parentConcepts: [],
    childConcepts: [],
    relatedConcepts: ['c2'],
    sourceReferences: [
      { fileId: 'f1', fileName: 'paper1.pdf', location: 'p3', excerpt: '...', context: '...' },
    ],
    clusterId: 'cl1',
    extractionTimestamp: new Date(),
  },
  {
    id: 'c2',
    name: 'Attention Mechanisms',
    description:
      'Allow models to focus on relevant parts of input sequences, dramatically improving performance in translation, summarisation, and other sequence tasks.',
    abstractionLevel: 'L2_APPROACH',
    domain: 'NLP',
    themes: ['Deep Learning', 'Transformers'],
    parentConcepts: [],
    childConcepts: [],
    relatedConcepts: ['c1'],
    sourceReferences: [
      { fileId: 'f2', fileName: 'paper2.pdf', location: 'p1', excerpt: '...', context: '...' },
      { fileId: 'f3', fileName: 'paper3.pdf', location: 'p5', excerpt: '...', context: '...' },
    ],
    clusterId: 'cl2',
    extractionTimestamp: new Date(),
  },
  {
    id: 'c3',
    name: 'Emergence in Complex Systems',
    description:
      'The phenomenon where large-scale patterns and behaviours arise from simple local interactions, a paradigm applicable across biology, physics, and AI.',
    abstractionLevel: 'L3_PARADIGM',
    domain: 'Systems Theory',
    themes: ['Complexity', 'Interdisciplinary'],
    parentConcepts: [],
    childConcepts: [],
    relatedConcepts: [],
    sourceReferences: [
      { fileId: 'f4', fileName: 'paper4.pdf', location: 'p2', excerpt: '...', context: '...' },
    ],
    clusterId: 'cl2',
    extractionTimestamp: new Date(),
  },
]

const MOCK_CLUSTERS: Cluster[] = [
  { id: 'cl1', name: 'Visual Generation', domain: 'Computer Vision', conceptIds: ['c1'] },
  { id: 'cl2', name: 'Foundational Approaches', domain: 'General', conceptIds: ['c2', 'c3'] },
]

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
