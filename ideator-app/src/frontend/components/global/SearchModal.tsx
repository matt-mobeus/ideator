// ============================================================================
// IDEATOR — Global Search Modal (FE-3.2)
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../composite/Modal';
import { Badge } from '../primitives/Badge';
import { useAppState } from '../../contexts/AppStateContext';
import type { Concept, AnalysisResult } from '../../../shared/types';

interface SearchResult {
  id: string;
  type: 'concept' | 'analysis';
  name: string;
  snippet: string;
  path: string;
}

export function SearchModal() {
  const { searchOpen, setSearchOpen, storage } = useAppState();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const lq = q.toLowerCase();
    const concepts = await storage.getConcepts({});
    const analyses = await storage.getAnalyses({});

    const found: SearchResult[] = [];
    for (const c of concepts) {
      if (c.name.toLowerCase().includes(lq) || c.description.toLowerCase().includes(lq)) {
        found.push({ id: c.id, type: 'concept', name: c.name, snippet: c.description.slice(0, 100), path: `/analyze/${c.id}` });
      }
    }
    for (const a of analyses) {
      const concept = concepts.find((c) => c.id === a.conceptId);
      const name = concept?.name ?? a.conceptId;
      if (name.toLowerCase().includes(lq) || a.qualitativeReport?.toLowerCase().includes(lq)) {
        found.push({ id: a.id, type: 'analysis', name: `Analysis: ${name}`, snippet: `Score: ${a.compositeScore}`, path: `/results` });
      }
    }
    setResults(found.slice(0, 20));
    setSelectedIdx(0);
  }, [storage]);

  useEffect(() => {
    if (!searchOpen) { setQuery(''); setResults([]); return; }
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, searchOpen, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[selectedIdx]) { navigate(results[selectedIdx].path); setSearchOpen(false); }
  };

  return (
    <Modal open={searchOpen} onClose={() => setSearchOpen(false)}>
      <input
        ref={inputRef}
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search concepts, analyses, assets... (↑↓ to navigate)"
        className="w-full bg-transparent border border-[var(--bg-tertiary)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-nav)] focus:outline-none mb-3"
      />
      {results.length > 0 ? (
        <div className="max-h-80 overflow-y-auto space-y-1">
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => { navigate(r.path); setSearchOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-[var(--radius-sm)] flex items-center gap-3 transition-colors ${
                i === selectedIdx ? 'bg-[var(--accent-nav)]/10 border border-[var(--accent-nav)]/30' : 'hover:bg-[var(--bg-tertiary)]/30'
              }`}
            >
              <Badge variant={r.type === 'concept' ? 'cyan' : 'green'}>{r.type}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-[var(--text-tertiary)] truncate">{r.snippet}</p>
              </div>
            </button>
          ))}
        </div>
      ) : query ? (
        <p className="text-sm text-[var(--text-tertiary)] py-4 text-center">No results found</p>
      ) : (
        <p className="text-sm text-[var(--text-tertiary)] py-4 text-center">Type to search</p>
      )}
    </Modal>
  );
}
