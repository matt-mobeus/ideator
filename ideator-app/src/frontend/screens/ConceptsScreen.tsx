// ============================================================================
// IDEATOR — Screen 2: Concept Population (FE-5.x)
// ============================================================================

export function ConceptsScreen() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-bold text-[var(--accent-nav)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Concepts
        </h1>
        <div className="flex items-center gap-4">
          {/* TODO FE-5.4: Filter panel */}
          {/* TODO FE-5.1: Search + count + new button */}
        </div>
      </div>

      {/* TODO FE-5.2: Cluster containers */}
      {/* TODO FE-5.3: Concept cards */}
      <div className="text-center py-16 text-[var(--text-tertiary)]">
        No concepts yet. Upload files to get started.
      </div>
    </div>
  );
}
