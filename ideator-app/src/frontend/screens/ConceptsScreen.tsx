// ============================================================================
// IDEATOR — Screen 2: Concept Population (FE-5.x)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/primitives';
import { Card, SearchInput, FilterDropdown, EmptyState, Accordion } from '../components/composite';
import { useAppState } from '../contexts/AppStateContext';
import type { Concept, ConceptCluster } from '../../shared/types';
import { AbstractionLevel } from '../../shared/types';

const ABSTRACTION_OPTIONS = [
  { value: AbstractionLevel.L1_SPECIFIC, label: 'L1 — Specific' },
  { value: AbstractionLevel.L2_APPROACH, label: 'L2 — Approach' },
  { value: AbstractionLevel.L3_PARADIGM, label: 'L3 — Paradigm' },
];

const ABSTRACTION_BADGES: Record<string, { label: string; color: 'cyan' | 'green' | 'magenta' }> = {
  [AbstractionLevel.L1_SPECIFIC]: { label: 'L1', color: 'cyan' },
  [AbstractionLevel.L2_APPROACH]: { label: 'L2', color: 'green' },
  [AbstractionLevel.L3_PARADIGM]: { label: 'L3', color: 'magenta' },
};

export function ConceptsScreen() {
  const navigate = useNavigate();
  const { storage, refresh: refreshApp } = useAppState();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [clusters, setClusters] = useState<ConceptCluster[]>([]);
  const [search, setSearch] = useState('');
  const [filterLevels, setFilterLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [allConcepts, allClusters] = await Promise.all([
      storage.getConcepts({}),
      storage.getClusters(),
    ]);
    setConcepts(allConcepts);
    setClusters(allClusters);
    setLoading(false);
  }, [storage]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = concepts.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterLevels.length > 0 && !filterLevels.includes(c.abstractionLevel)) return false;
    return true;
  });

  const clusteredConcepts = clusters.map((cluster) => ({
    cluster,
    concepts: filtered.filter((c) => c.clusterId === cluster.id),
  })).filter((g) => g.concepts.length > 0);

  const unclustered = filtered.filter((c) => !c.clusterId || !clusters.find((cl) => cl.id === c.clusterId));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 border-2 border-[var(--accent-nav)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <EmptyState
        title="No concepts yet"
        description="Upload and ingest files to extract concepts"
        actionLabel="Go to Upload"
        onAction={() => navigate('/upload')}
      />
    );
  }

  const sections = [
    ...clusteredConcepts.map((g) => ({
      id: g.cluster.id,
      title: <span className="text-[var(--text-primary)]">{g.cluster.name}</span>,
      badge: <Badge variant="neutral">{g.concepts.length}</Badge>,
      content: (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {g.concepts.map((concept) => (
            <ConceptCard key={concept.id} concept={concept} onClick={() => navigate(`/analyze/${concept.id}`)} />
          ))}
        </div>
      ),
    })),
    ...(unclustered.length > 0 ? [{
      id: '__unclustered',
      title: <span className="text-[var(--text-secondary)]">Unclustered</span>,
      badge: <Badge variant="neutral">{unclustered.length}</Badge>,
      content: (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {unclustered.map((concept) => (
            <ConceptCard key={concept.id} concept={concept} onClick={() => navigate(`/analyze/${concept.id}`)} />
          ))}
        </div>
      ),
    }] : []),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[var(--accent-nav)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Concepts
          </h1>
          <Badge variant="neutral">{filtered.length}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            onClear={() => setSearch('')}
            placeholder="Search concepts..."
            className="w-64"
          />
          <FilterDropdown
            label="Level"
            options={ABSTRACTION_OPTIONS}
            selected={filterLevels}
            onChange={setFilterLevels}
          />
        </div>
      </div>

      <Accordion
        sections={sections}
        defaultOpen={sections.slice(0, 3).map((s) => s.id)}
      />
    </div>
  );
}

function ConceptCard({ concept, onClick }: { concept: Concept; onClick: () => void }) {
  const badge = ABSTRACTION_BADGES[concept.abstractionLevel] ?? { label: '?', color: 'neutral' as const };
  return (
    <Card
      glow="cyan"
      className="shrink-0 w-[180px] h-[220px] flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold line-clamp-2 flex-1">{concept.name}</h3>
        <Badge variant={badge.color}>{badge.label}</Badge>
      </div>
      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-auto">{concept.description}</p>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--bg-tertiary)]">
        <span className="text-xs text-[var(--text-tertiary)]">{concept.sourceReferences?.length ?? 0} sources</span>
        <span className="text-xs text-[var(--accent-nav)] opacity-0 group-hover:opacity-100 transition-opacity">Analyze →</span>
      </div>
    </Card>
  );
}
