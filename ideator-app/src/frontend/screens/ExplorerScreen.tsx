// ============================================================================
// IDEATOR — Screen 6: Concept Explorer (FE-9.x, FE-10.x, FE-11.x)
// ============================================================================

import { useParams, useNavigate } from 'react-router-dom';

export function ExplorerScreen() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-theme(spacing.14)-theme(spacing.12))]  flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate('/results')}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-nav)] transition-colors"
        >
          Results
        </button>
        <span className="text-[var(--text-tertiary)]">/</span>
        <span className="text-sm text-[var(--accent-nav)]">Explorer</span>
      </div>

      {/* Three-zone layout */}
      <div className="flex-1 grid grid-cols-[1fr_320px] grid-rows-[1fr_120px] gap-4">
        {/* Central viewer / visualization canvas */}
        <div className="border border-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-4 flex items-center justify-center">
          {/* TODO FE-10.1: Unified canvas container */}
          {/* TODO FE-11.1: Branching tree visualization */}
          {/* TODO FE-11.2: Interactive node map */}
          <p className="text-[var(--text-tertiary)]">Visualization canvas</p>
        </div>

        {/* Right detail panel */}
        <div className="border border-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-4 row-span-2 overflow-y-auto">
          {/* TODO FE-9.3: Detail panel */}
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <p className="text-[var(--text-tertiary)]">Select a node to view details</p>
        </div>

        {/* Bottom source strip */}
        <div className="border border-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-4 overflow-x-auto">
          {/* TODO FE-9.4: Source excerpts strip */}
          <p className="text-[var(--text-tertiary)] text-sm">Source excerpts</p>
        </div>
      </div>

      <p className="text-xs text-[var(--text-tertiary)] mt-2">Concept: {conceptId}</p>
    </div>
  );
}
