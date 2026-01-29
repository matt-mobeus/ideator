// ============================================================================
// IDEATOR — Global Search Modal (FE-3.2)
// ============================================================================

import { useState } from 'react';
import { Modal } from '../composite/Modal';
import { useAppState } from '../../contexts/AppStateContext';

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useAppState();
  const [query, setQuery] = useState('');

  return (
    <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search concepts, analyses, assets..."
        className="w-full bg-transparent border border-[var(--bg-tertiary)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-nav)] focus:outline-none mb-4"
      />
      {/* TODO: Real-time search results */}
      <p className="text-sm text-[var(--text-tertiary)]">
        {query ? 'Searching...' : 'Type to search'}
      </p>
    </Modal>
  );
}
