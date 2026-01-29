// ============================================================================
// IDEATOR — Screen 3: Analysis Trigger (FE-6.x)
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Tag } from '../components/primitives';
import { Card, ProgressBar } from '../components/composite';
import { useAppState } from '../contexts/AppStateContext';
import { useAnalysisQueue } from '../hooks/useAnalysisQueue';
import { useToast } from '../contexts/ToastContext';
import type { Concept, AnalysisResult } from '../../shared/types';
import { JobStatus, AnalysisPhase } from '../../shared/types';

const PHASE_LABELS: Record<string, string> = {
  [AnalysisPhase.SEARCHING_TRENDS]: 'Searching market trends...',
  [AnalysisPhase.ANALYZING_FEASIBILITY]: 'Analyzing technical feasibility...',
  [AnalysisPhase.EVALUATING_INVESTMENT]: 'Evaluating investment potential...',
  [AnalysisPhase.GENERATING_VISUALIZATIONS]: 'Generating visualizations...',
  [AnalysisPhase.COMPILING_REPORT]: 'Compiling report...',
};

export function AnalysisScreen() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { storage } = useAppState();
  const { jobs, enqueue } = useAnalysisQueue(storage);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!conceptId) return;
      const c = await storage.getConcept(conceptId);
      setConcept(c ?? null);
      const analyses = await storage.getAnalyses({ conceptId });
      setAnalysis(analyses[0] ?? null);
      setLoading(false);
    })();
  }, [conceptId, storage]);

  const conceptJob = jobs.find((j) => j.conceptId === conceptId);
  const isQueued = conceptJob?.status === JobStatus.QUEUED;
  const isProcessing = conceptJob?.status === JobStatus.PROCESSING;
  const isAnalyzed = !!analysis;

  const handleAnalyze = async () => {
    if (!conceptId) return;
    await enqueue(conceptId);
    toast.info('Analysis queued');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <span className="animate-spin h-8 w-8 border-2 border-[var(--accent-nav)] border-t-transparent rounded-full" />
    </div>;
  }

  if (!concept) {
    return <div className="text-center py-16 text-[var(--text-tertiary)]">Concept not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/concepts')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-nav)] mb-4 transition-colors">
        ← Back to Concepts
      </button>

      {/* Concept detail */}
      <Card className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{concept.name}</h1>
        <p className="text-[var(--text-secondary)] mb-4">{concept.description}</p>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="cyan">{concept.abstractionLevel.replace('_', ' ')}</Badge>
          {concept.domain && <Badge variant="blue">{concept.domain}</Badge>}
          {concept.themes?.map((theme) => <Tag key={theme} label={theme} color="neutral" />)}
        </div>
        {concept.sourceReferences && concept.sourceReferences.length > 0 && (
          <div className="border-t border-[var(--bg-tertiary)] pt-3">
            <h3 className="text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">Source References</h3>
            <div className="space-y-1">
              {concept.sourceReferences.map((ref, i) => (
                <p key={i} className="text-xs text-[var(--text-secondary)]">
                  {ref.fileName} — {ref.location}
                </p>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Analysis trigger */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>Market Analysis</h2>
          <Button
            variant="creative"
            onClick={handleAnalyze}
            disabled={isQueued || isProcessing || isAnalyzed}
            className={!isQueued && !isProcessing && !isAnalyzed ? 'shadow-[0_0_16px_rgba(255,0,255,0.3)]' : ''}
          >
            {isAnalyzed ? 'Analysis Complete' : isProcessing ? 'Processing...' : isQueued ? 'Queued' : 'Run Market Analysis'}
          </Button>
        </div>

        {isProcessing && conceptJob && (
          <ProgressBar
            value={conceptJob.progress}
            phase={conceptJob.currentPhase ? PHASE_LABELS[conceptJob.currentPhase] ?? conceptJob.currentPhase : 'Starting...'}
            color="magenta"
          />
        )}

        {isAnalyzed && analysis && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Score:</span>
                <span className="text-2xl font-bold text-[var(--accent-success)]">{analysis.compositeScore}</span>
                <span className="text-sm text-[var(--text-tertiary)]">/ 100</span>
              </div>
              <Badge variant="green">{analysis.validityTier.replace('_', ' ')}</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => navigate('/results')}>View Results</Button>
              <Button variant="secondary" onClick={() => navigate(`/provenance/${conceptId}`)}>View Provenance</Button>
              <Button variant="secondary" onClick={() => navigate(`/explore/${conceptId}`)}>Explore</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Queue panel */}
      {jobs.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-3 text-[var(--text-secondary)]">Analysis Queue</h3>
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between px-3 py-2 bg-[var(--bg-primary)] rounded-[var(--radius-sm)]">
                <span className="text-sm">{job.conceptId === conceptId ? concept.name : job.conceptId}</span>
                <Badge variant={job.status === JobStatus.COMPLETED ? 'green' : job.status === JobStatus.PROCESSING ? 'magenta' : 'neutral'}>
                  {job.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
