import { useState, useMemo, useEffect } from 'react'
import type { Concept, Cluster } from '@/types/concept.ts'
import { pipelineStore } from '@/services/pipeline/store.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Badge from '@/components/ui/Badge.tsx'
import { PageHeader, SplitPanel } from '@/components/global'
import FilterPanel from './FilterPanel.tsx'
import ClusterContainer from './ClusterContainer.tsx'
import { MOCK_CONCEPTS, MOCK_CLUSTERS } from '@/fixtures/concepts-mock-data.ts'
import { normalizeConcept } from '@/services/concept-extraction.service.ts'

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
          setPipelineConcepts(conceptTask.output.concepts.map(normalizeConcept))
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

  const LEVEL_LABELS: Record<string, string> = {
    L1_SPECIFIC: 'L1 — Specific',
    L2_APPROACH: 'L2 — Approach',
    L3_PARADIGM: 'L3 — Paradigm',
  }

  const clusters: Cluster[] = useMemo(() => {
    if (!pipelineConcepts) return MOCK_CLUSTERS
    const levelGroups = new Map<string, string[]>()
    concepts.forEach((c) => {
      const key = c.abstractionLevel || 'L2_APPROACH'
      if (!levelGroups.has(key)) levelGroups.set(key, [])
      levelGroups.get(key)!.push(c.id)
    })
    return Array.from(levelGroups.entries()).map(([level, ids]) => ({
      id: `auto-${level}`,
      name: LEVEL_LABELS[level] || level,
      domain: '',
      conceptIds: ids,
    }))
  }, [pipelineConcepts, concepts])

  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])

  const levelFilters = useMemo(() => {
    const levels = ['L1_SPECIFIC', 'L2_APPROACH', 'L3_PARADIGM'] as const
    return levels
      .map((level) => {
        const levelConcepts = concepts.filter((c) => c.abstractionLevel === level)
        return {
          level,
          label: LEVEL_LABELS[level] || level,
          domains: unique(levelConcepts.map((c) => c.domain)).filter(Boolean),
          themes: unique(levelConcepts.flatMap((c) => c.themes)).filter(Boolean),
        }
      })
      .filter((lf) => lf.domains.length > 0 || lf.themes.length > 0)
  }, [concepts])

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
    <div className="flex h-full flex-col gap-6">
      <PageHeader
        title="Concepts"
        actions={<Badge variant="cyan">{filtered.length}</Badge>}
      />

      {pipelineState === 'running' && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-blue)] bg-[rgba(68,136,255,0.08)] p-3 text-sm" style={{ color: 'var(--color-blue)' }}>
          Pipeline running — concepts will appear when extraction completes.
        </div>
      )}
      {pipelineState === 'error' && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-orange)] bg-[rgba(255,102,0,0.08)] p-3 text-sm" style={{ color: 'var(--color-orange)' }}>
          Pipeline encountered an error. Showing sample data.
        </div>
      )}

      <SplitPanel
        sidebar={
          <FilterPanel
            levelFilters={levelFilters}
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
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
          {filtered.length === 0 ? (
            <EmptyState title="No matching concepts" description="Try adjusting your filters." />
          ) : (
            clusters
              .map((cluster) => {
                const clusterConcepts = filtered.filter((c) => cluster.conceptIds.includes(c.id))
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
