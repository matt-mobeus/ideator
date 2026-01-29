// ============================================================================
// IDEATOR — Screen 3: Analysis Trigger (FE-6.x)
// ============================================================================

import { useParams, useNavigate } from 'react-router-dom';

export function AnalysisScreen() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/concepts')}
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-nav)] mb-4 transition-colors"
      >
        ← Back to Concepts
      </button>

      <h1
        className="text-3xl font-bold mb-6 text-[var(--accent-nav)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Analysis
      </h1>

      {/* TODO FE-6.2: Concept detail card */}
      {/* TODO FE-6.3: Analysis trigger & queue */}
      <p className="text-[var(--text-tertiary)]">
        Concept: {conceptId}
      </p>
    </div>
  );
}
