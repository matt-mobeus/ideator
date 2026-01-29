// ============================================================================
// IDEATOR — Screen 5: All Results (FE-8.x)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge } from '../components/primitives';
import { Card, SearchInput, Accordion, EmptyState } from '../components/composite';
import { useAppState } from '../contexts/AppStateContext';
import type { AnalysisResult, Concept } from '../../shared/types';
import { ValidityTier } from '../../shared/types';

const TIER_CONFIG: Record<string, { label: string; color: string; badge: 'green' | 'orange' | 'magenta' | 'neutral' }> = {
  [ValidityTier.T1_HIGH]: { label: 'High Potential', color: 'var(--accent-success)', badge: 'green' },
  [ValidityTier.T2_MODERATE]: { label: 'Moderate Potential', color: 'var(--accent-warning)', badge: 'orange' },
  [ValidityTier.T3_LOW]: { label: 'Low Potential', color: 'var(--accent-creative)', badge: 'magenta' },
  [ValidityTier.T4_NOT_VIABLE]: { label: 'Not Viable', color: 'var(--accent-neutral)', badge: 'neutral' },
};

const TIER_ORDER = [ValidityTier.T1_HIGH, ValidityTier.T2_MODERATE, ValidityTier.T3_LOW, ValidityTier.T4_NOT_VIABLE];

export function ResultsScreen() {
  const navigate = useNavigate();
  const { storage } = useAppState();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [concepts, setConcepts] = useState<Map<string, Concept>>(new Map());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const allAnalyses = await storage.getAnalyses({});
    const allConcepts = await storage.getConcepts({});
    const conceptMap = new Map(allConcepts.map((c) => [c.id, c]));
    setAnalyses(allAnalyses);
    setConcepts(conceptMap);
    setLoading(false);
  }, [storage]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = analyses.filter((a) => {
    if (!search) return true;
    const concept = concepts.get(a.conceptId);
    return concept?.name.toLowerCase().includes(search.toLowerCase()) ||
           concept?.description.toLowerCase().includes(search.toLowerCase());
  });

  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    config: TIER_CONFIG[tier],
    results: filtered.filter((a) => a.validityTier === tier).sort((a, b) => b.compositeScore - a.compositeScore),
  }));

  const selected = selectedId ? analyses.find((a) => a.id === selectedId) : null;
  const selectedConcept = selected ? concepts.get(selected.conceptId) : null;

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <span className="animate-spin h-8 w-8 border-2 border-[var(--accent-nav)] border-t-transparent rounded-full" />
    </div>;
  }

  if (analyses.length === 0) {
    return <EmptyState title="No results yet" description="Analyze concepts to see results here" actionLabel="Go to Concepts" onAction={() => navigate('/concepts')} />;
  }

  return (
    <div className="flex gap-6">
      {/* Main results */}
      <div className={`flex-1 ${selected ? 'max-w-[60%]' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[var(--accent-nav)]" style={{ fontFamily: 'var(--font-heading)' }}>Results</h1>
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} onClear={() => setSearch('')} placeholder="Search results..." className="w-64" />
          </div>
        </div>

        <Accordion
          sections={grouped.filter((g) => g.results.length > 0).map((g) => ({
            id: g.tier,
            title: <span style={{ color: g.config.color }}>{g.config.label}</span>,
            badge: <Badge variant={g.config.badge}>{g.results.length}</Badge>,
            content: (
              <div className="space-y-2">
                {g.results.map((result) => {
                  const concept = concepts.get(result.conceptId);
                  return (
                    <Card key={result.id} glow={selectedId === result.id ? 'cyan' : 'none'} className="cursor-pointer" onClick={() => setSelectedId(result.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate">{concept?.name ?? result.conceptId}</h3>
                          {concept?.domain && <Badge variant="blue">{concept.domain}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          {/* Score bar */}
                          <div className="w-24 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${result.compositeScore}%`, backgroundColor: g.config.color }} />
                          </div>
                          <span className="text-sm font-mono w-8 text-right">{result.compositeScore}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedId(result.id); }}>Details</Button>
                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); navigate(`/explore/${result.conceptId}`); }}>Explore</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ),
          }))}
          defaultOpen={[ValidityTier.T1_HIGH]}
        />
      </div>

      {/* Detail slide-out */}
      {selected && selectedConcept && (
        <div className="w-[40%] min-w-[320px] border-l border-[var(--bg-tertiary)] pl-6 max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{selectedConcept.name}</h2>
            <button onClick={() => setSelectedId(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">×</button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Composite Score</span>
              <div className="text-3xl font-bold text-[var(--accent-success)]">{selected.compositeScore}<span className="text-sm text-[var(--text-tertiary)]"> / 100</span></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <ScoreDimension label="Market" score={selected.marketViability.score} />
              <ScoreDimension label="Technical" score={selected.technicalFeasibility.score} />
              <ScoreDimension label="Investment" score={selected.investmentPotential.score} />
            </div>
            {selected.qualitativeReport && (
              <div className="border-t border-[var(--bg-tertiary)] pt-4">
                <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Report</h3>
                <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {selected.qualitativeReport.executiveSummary}
                </div>
              </div>
            )}
            {selected.evidenceCitations && selected.evidenceCitations.length > 0 && (
              <div className="border-t border-[var(--bg-tertiary)] pt-4">
                <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Citations</h3>
                <div className="space-y-1">
                  {selected.evidenceCitations.map((c, i) => (
                    <p key={i} className="text-xs text-[var(--text-secondary)]">[{i + 1}] {c.source ?? JSON.stringify(c)}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button onClick={() => navigate(`/provenance/${selected.conceptId}`)}>Provenance</Button>
              <Button variant="creative" onClick={() => navigate(`/explore/${selected.conceptId}`)}>Explore</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreDimension({ label, score }: { label: string; score: number }) {
  return (
    <div className="text-center">
      <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
      <div className="text-xl font-bold">{score}</div>
    </div>
  );
}
