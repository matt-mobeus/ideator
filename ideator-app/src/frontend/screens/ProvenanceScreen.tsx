// ============================================================================
// IDEATOR — Screen 4: Source-to-Asset Mapping (FE-7.x)
// ============================================================================

import { useParams, useNavigate } from 'react-router-dom';

export function ProvenanceScreen() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-nav)] mb-4 transition-colors"
      >
        ← Back
      </button>

      <h1
        className="text-3xl font-bold mb-6 text-[var(--accent-nav)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Source → Asset Provenance
      </h1>

      {/* TODO FE-7.2: Source panel (left) */}
      {/* TODO FE-7.3: Claims panel (right) */}
      {/* TODO FE-7.4: Asset generation modal */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-6 min-h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Sources</h2>
          <p className="text-[var(--text-tertiary)]">Source excerpts will appear here</p>
        </div>
        <div className="border border-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-6 min-h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Claims</h2>
          <p className="text-[var(--text-tertiary)]">Generated claims will appear here</p>
        </div>
      </div>
      <p className="text-xs text-[var(--text-tertiary)] mt-2">Concept: {conceptId}</p>
    </div>
  );
}
