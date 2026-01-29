// ============================================================================
// IDEATOR — Screen 4: Source-to-Asset Mapping (FE-7.x)
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge } from '../components/primitives';
import { Card, Modal, EmptyState } from '../components/composite';
import { useAppState } from '../contexts/AppStateContext';
import { useToast } from '../contexts/ToastContext';
import type { Concept, GeneratedAsset } from '../../shared/types';
import { AssetType } from '../../shared/types';

interface ProvenanceClaim {
  id: string;
  claim: string;
  confidence: number;
  sourceIndices: number[];
}

const DOCUMENT_TYPES = [
  { type: AssetType.EXECUTIVE_SUMMARY, label: 'Executive Summary' },
  { type: AssetType.PITCH_DECK, label: 'Pitch Deck' },
  { type: AssetType.ONE_PAGER, label: 'One-Pager' },
  { type: AssetType.TECHNICAL_BRIEF, label: 'Technical Brief' },
  { type: AssetType.MARKET_REPORT, label: 'Market Report' },
  { type: AssetType.WHITEPAPER, label: 'Whitepaper' },
];

export function ProvenanceScreen() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { storage } = useAppState();
  const [concept, setConcept] = useState<Concept | null>(null);
  const [claims, setClaims] = useState<ProvenanceClaim[]>([]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [hoveredClaim, setHoveredClaim] = useState<string | null>(null);
  const [hoveredSource, setHoveredSource] = useState<number | null>(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!conceptId) return;
      const c = await storage.getConcept(conceptId);
      setConcept(c ?? null);
      const allAssets = await storage.getAssets(conceptId);
      setAssets(allAssets);

      // Load provenance data
      const provRecords = await storage.getProvenance(conceptId);
      const mappedClaims: ProvenanceClaim[] = provRecords.map((p, i) => ({
        id: p.id,
        claim: p.claim ?? `Claim ${i + 1}`,
        confidence: p.confidence ?? 0.5,
        sourceIndices: p.sourceIndices ?? [],
      }));
      setClaims(mappedClaims);
      setLoading(false);
    })();
  }, [conceptId, storage]);

  const sources = concept?.sourceReferences ?? [];
  const highlightedSourceIndices = hoveredClaim
    ? claims.find((c) => c.id === hoveredClaim)?.sourceIndices ?? []
    : hoveredSource !== null ? [hoveredSource] : [];
  const highlightedClaimIds = hoveredSource !== null
    ? claims.filter((c) => c.sourceIndices.includes(hoveredSource)).map((c) => c.id)
    : hoveredClaim ? [hoveredClaim] : [];

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <span className="animate-spin h-8 w-8 border-2 border-[var(--accent-nav)] border-t-transparent rounded-full" />
    </div>;
  }

  if (!concept) {
    return <div className="text-center py-16 text-[var(--text-tertiary)]">Concept not found</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-nav)] mb-2 transition-colors">← Back</button>
          <h1 className="text-2xl font-bold text-[var(--accent-nav)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Source → Asset Provenance
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">{concept.name}</p>
        </div>
        <Button variant="creative" onClick={() => setAssetModalOpen(true)}>Generate Assets</Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Source panel */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Sources</h2>
          {sources.length === 0 ? (
            <Card><p className="text-[var(--text-tertiary)] text-sm">No source references</p></Card>
          ) : (
            <div className="space-y-2">
              {sources.map((ref, i) => (
                <Card
                  key={i}
                  glow={highlightedSourceIndices.includes(i) ? 'cyan' : 'none'}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredSource(i)}
                  onMouseLeave={() => setHoveredSource(null)}
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="neutral">{i + 1}</Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ref.fileName}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{ref.location}</p>
                      {ref.excerpt && <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-3">{ref.excerpt}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Claims panel */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Claims</h2>
          {claims.length === 0 ? (
            <Card><p className="text-[var(--text-tertiary)] text-sm">No provenance claims generated</p></Card>
          ) : (
            <div className="space-y-2">
              {claims.map((claim) => (
                <Card
                  key={claim.id}
                  glow={highlightedClaimIds.includes(claim.id) ? 'green' : 'none'}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredClaim(claim.id)}
                  onMouseLeave={() => setHoveredClaim(null)}
                >
                  <p className="text-sm mb-2">{claim.claim}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {claim.sourceIndices.map((si) => (
                        <Badge key={si} variant="neutral">{si + 1}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent-success)] rounded-full"
                          style={{ width: `${claim.confidence * 100}%`, opacity: 0.3 + claim.confidence * 0.7 }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">{Math.round(claim.confidence * 100)}%</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Existing assets */}
      {assets.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Generated Assets</h2>
          <div className="grid grid-cols-3 gap-3">
            {assets.map((asset) => (
              <Card key={asset.id}>
                <h3 className="text-sm font-medium mb-1">{asset.assetType.replace(/_/g, ' ')}</h3>
                <p className="text-xs text-[var(--text-tertiary)]">Generated {new Date(asset.generatedTimestamp).toLocaleDateString()}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Asset generation modal */}
      <Modal open={assetModalOpen} onClose={() => setAssetModalOpen(false)} title="Generate Assets">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Documents</h3>
          <div className="grid grid-cols-2 gap-2">
            {DOCUMENT_TYPES.map((dt) => (
              <Button key={dt.type} variant="secondary" onClick={() => { toast.info(`Generating ${dt.label}...`); setAssetModalOpen(false); }}>
                {dt.label}
              </Button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
