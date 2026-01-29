// ============================================================================
// IDEATOR — Screen 5: All Results (FE-8.x)
// ============================================================================

export function ResultsScreen() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-bold text-[var(--accent-nav)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Results
        </h1>
        <div className="flex items-center gap-4">
          {/* TODO FE-8.1: Search, filters, sort, export */}
        </div>
      </div>

      {/* TODO FE-8.2: Tier accordion sections */}
      {/* TODO FE-8.3: Result cards */}
      {/* TODO FE-8.4: Detail slide-out panel */}
      {/* TODO FE-8.5: Export functionality */}
      <div className="text-center py-16 text-[var(--text-tertiary)]">
        No analysis results yet. Analyze concepts to see results.
      </div>
    </div>
  );
}
