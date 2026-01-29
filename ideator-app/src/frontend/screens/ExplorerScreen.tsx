// ============================================================================
// IDEATOR — Screen 6: Concept Explorer (FE-9.x, FE-10.x, FE-11.x)
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { Button, Badge } from '../components/primitives';
import { Card, Breadcrumb } from '../components/composite';
import { ProgressBar } from '../components/composite';
import { useAppState } from '../contexts/AppStateContext';
import type {
  Concept,
  TimelineNode,
  TimelineEdge,
  MapNode,
  AnalysisResult,
  ConceptCluster,
  GeneratedAsset,
} from '../../shared/types';
import {
  TimelineNodeType,
  MapNodeType,
  EdgeRelationshipType,
} from '../../shared/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type DrillLevel = 0 | 1 | 2 | 3 | 4;

const DRILL_LABELS: Record<DrillLevel, string> = {
  0: 'Overview',
  1: 'Concept',
  2: 'Components',
  3: 'Technical',
  4: 'Source',
};

/** FE-9.2: context-sensitive drill-down button labels */
const DRILL_BUTTON_LABELS: Record<DrillLevel, string> = {
  0: 'View Details',
  1: 'View Components',
  2: 'Technical Specs',
  3: 'View Source',
  4: '', // deepest – button hidden
};

/** FE-10.2: content-type enum for media-reactive display */
type ContentType =
  | 'concept-overview'
  | 'visualization'
  | 'analysis-report'
  | 'source-material'
  | 'generated-asset';

// D3 colour map for node types
const NODE_COLORS: Record<string, string> = {
  [MapNodeType.CONCEPT]: '#00FFFF',
  [MapNodeType.PATENT]: '#FF00FF',
  [MapNodeType.PUBLICATION]: '#00FF88',
  [MapNodeType.PERSON]: '#FF6600',
  [MapNodeType.COMPANY]: '#FFCC00',
  [MapNodeType.EVENT]: '#FFFFFF',
};

const TIMELINE_NODE_SHAPES: Record<string, string> = {
  [TimelineNodeType.ORIGIN]: '◆',
  [TimelineNodeType.VARIATION]: '●',
  [TimelineNodeType.MERGE]: '▲',
  [TimelineNodeType.CURRENT]: '■',
  [TimelineNodeType.PROJECTED]: '◇',
};

/** Edge style map per spec §6.1.2 */
const EDGE_STYLES: Record<string, { dash: string; color: string; width: number }> = {
  [EdgeRelationshipType.CREATED]: { dash: '', color: '#AAAACC', width: 2 },
  [EdgeRelationshipType.REFERENCED]: { dash: '2,4', color: '#888899', width: 1 },
  [EdgeRelationshipType.FUNDED]: { dash: '6,3', color: '#FFCC00', width: 1.5 },
  [EdgeRelationshipType.EMPLOYED]: { dash: '', color: '#888899', width: 1 },
  [EdgeRelationshipType.COMPETED]: { dash: '4,4', color: '#FF4444', width: 1.5 },
  [EdgeRelationshipType.DERIVED]: { dash: '', color: '#555577', width: 1.5 },
  [EdgeRelationshipType.MERGED]: { dash: '', color: '#00FF88', width: 2 },
  [EdgeRelationshipType.INFLUENCED]: { dash: '4,2', color: '#4488FF', width: 1 },
  [EdgeRelationshipType.CITED]: { dash: '2,4', color: '#888899', width: 1 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExplorerScreen() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const { storage } = useAppState();

  // Core state
  const [concept, setConcept] = useState<Concept | null>(null);
  const [drillLevel, setDrillLevel] = useState<DrillLevel>(0);
  const [viewMode, setViewMode] = useState<'tree' | 'map'>('tree');
  const [timelineNodes, setTimelineNodes] = useState<TimelineNode[]>([]);
  const [timelineEdges, setTimelineEdges] = useState<TimelineEdge[]>([]);
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data for context-sensitive detail panel (FE-9.3) & media-reactive display (FE-10.2)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [clusters, setClusters] = useState<ConceptCluster[]>([]);
  const [relatedConcepts, setRelatedConcepts] = useState<Concept[]>([]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);

  const treeRef = useRef<SVGSVGElement>(null);
  const mapRef = useRef<SVGSVGElement>(null);

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------

  useEffect(() => {
    (async () => {
      if (!conceptId) return;

      const [c, analysisResult, allClusters, conceptAssets] = await Promise.all([
        storage.getConcept(conceptId),
        storage.getAnalysis(conceptId),
        storage.getClusters(),
        storage.getAssets(conceptId),
      ]);

      setConcept(c ?? null);
      setAnalysis(analysisResult ?? null);
      setClusters(allClusters);
      setAssets(conceptAssets);

      // Related concepts
      if (c) {
        const relatedIds = [...(c.relatedConcepts ?? []), ...(c.parentConcepts ?? []), ...(c.childConcepts ?? [])];
        const related: Concept[] = [];
        for (const rid of relatedIds) {
          const rc = await storage.getConcept(rid);
          if (rc) related.push(rc);
        }
        setRelatedConcepts(related);
      }

      // Visualization data
      const tNodes = await storage.getTimelineNodes(conceptId);
      const nodeIds = tNodes.map((n: TimelineNode) => n.id);
      const tEdges = nodeIds.length > 0 ? await storage.getTimelineEdges(nodeIds) : [];
      const mNodes = await storage.getMapNodes();
      setTimelineNodes(tNodes);
      setTimelineEdges(tEdges);
      setMapNodes(mNodes);
      setLoading(false);
    })();
  }, [conceptId, storage]);

  // -------------------------------------------------------------------------
  // FE-10.2: Content type detection
  // -------------------------------------------------------------------------

  const detectContentType = useCallback((): ContentType => {
    if (drillLevel === 4) return 'source-material';
    if (drillLevel === 0) return 'concept-overview';
    if (drillLevel === 1 && analysis) return 'analysis-report';
    if (assets.length > 0 && drillLevel === 2) {
      // If selected node is an asset-related node, show asset preview
      const selMap = mapNodes.find((n) => n.id === selectedNode);
      if (selMap?.metadata?.assetId) return 'generated-asset';
    }
    // Default: visualization + node detail
    return 'visualization';
  }, [drillLevel, analysis, assets, mapNodes, selectedNode]);

  const contentType = detectContentType();

  // -------------------------------------------------------------------------
  // Keyboard: Escape to go back up
  // -------------------------------------------------------------------------

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drillLevel > 0) {
        e.preventDefault();
        setDrillLevel((l) => Math.max(0, l - 1) as DrillLevel);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drillLevel]);

  // -------------------------------------------------------------------------
  // D3 tree visualization
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (viewMode !== 'tree' || !treeRef.current || timelineNodes.length === 0) return;
    const svg = d3.select(treeRef.current);
    svg.selectAll('*').remove();
    const width = treeRef.current.clientWidth || 800;
    const height = treeRef.current.clientHeight || 400;
    const g = svg.append('g').attr('transform', `translate(40, ${height / 2})`);

    // Horizontal layout
    const xScale = d3.scaleLinear().domain([0, timelineNodes.length - 1]).range([0, width - 80]);

    // Draw edges with spec-defined styling
    timelineEdges.forEach((edge) => {
      const sourceIdx = timelineNodes.findIndex((n) => n.id === edge.sourceNodeId);
      const targetIdx = timelineNodes.findIndex((n) => n.id === edge.targetNodeId);
      if (sourceIdx >= 0 && targetIdx >= 0) {
        const style = EDGE_STYLES[edge.relationshipType] ?? { dash: '', color: '#333355', width: 1.5 };
        g.append('line')
          .attr('x1', xScale(sourceIdx)).attr('y1', 0)
          .attr('x2', xScale(targetIdx)).attr('y2', 0)
          .attr('stroke', style.color)
          .attr('stroke-width', Math.max(style.width, edge.strength * 3))
          .attr('stroke-dasharray', edge.relationshipType === EdgeRelationshipType.COMPETED ? '4,4' : style.dash);
      }
    });

    // Draw nodes
    const nodes = g.selectAll('.node').data(timelineNodes).enter().append('g')
      .attr('transform', (_d: TimelineNode, i: number) => `translate(${xScale(i)}, 0)`)
      .attr('class', 'node cursor-pointer')
      .on('click', (_e: MouseEvent, d: TimelineNode) => setSelectedNode(d.id));

    nodes.append('circle')
      .attr('r', (d: TimelineNode) => d.nodeType === TimelineNodeType.CURRENT ? 8 : 6)
      .attr('fill', (d: TimelineNode) => d.nodeType === TimelineNodeType.PROJECTED ? 'none' : '#00FFFF')
      .attr('stroke', '#00FFFF')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d: TimelineNode) => d.nodeType === TimelineNodeType.PROJECTED ? '3,3' : 'none');

    // Tooltip on hover
    nodes.append('title')
      .text((d: TimelineNode) => `${d.label}\n${d.description ?? ''}`);

    nodes.append('text')
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#AAAACC')
      .attr('font-size', '10px')
      .text((d: TimelineNode) => d.label ?? d.id.slice(0, 8));

    // Zoom + pan
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 3]).on('zoom', (event) => {
      g.attr('transform', event.transform.toString());
    });
    svg.call(zoom);
  }, [viewMode, timelineNodes, timelineEdges]);

  // -------------------------------------------------------------------------
  // D3 force-directed node map
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (viewMode !== 'map' || !mapRef.current || mapNodes.length === 0) return;
    const svg = d3.select(mapRef.current);
    svg.selectAll('*').remove();
    const width = mapRef.current.clientWidth || 800;
    const height = mapRef.current.clientHeight || 400;

    interface SimNode extends d3.SimulationNodeDatum {
      id: string;
      nodeType: string;
      label: string;
      importance?: number;
    }

    const simNodes: SimNode[] = mapNodes.map((n) => ({
      id: n.id,
      nodeType: n.nodeType,
      label: n.label,
      importance: n.importance,
      x: width / 2,
      y: height / 2,
    }));

    // Use timeline edges for links between map nodes when available
    interface SimLink extends d3.SimulationLinkDatum<SimNode> {
      relType?: string;
    }
    const simLinks: SimLink[] = [];
    const nodeIdSet = new Set(simNodes.map((n) => n.id));

    timelineEdges.forEach((e) => {
      if (nodeIdSet.has(e.sourceNodeId) && nodeIdSet.has(e.targetNodeId)) {
        simLinks.push({ source: e.sourceNodeId, target: e.targetNodeId, relType: e.relationshipType });
      }
    });
    // Fallback: consecutive links if no edges available
    if (simLinks.length === 0) {
      for (let i = 1; i < simNodes.length; i++) {
        simLinks.push({ source: simNodes[i - 1].id, target: simNodes[i].id });
      }
    }

    const sim = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const g = svg.append('g');

    // Edge rendering by relationship type (FE-11.2)
    const link = g.selectAll('.link').data(simLinks).enter().append('line')
      .attr('stroke', (d: SimLink) => {
        const s = d.relType ? EDGE_STYLES[d.relType] : undefined;
        return s ? s.color : '#333355';
      })
      .attr('stroke-width', (d: SimLink) => {
        const s = d.relType ? EDGE_STYLES[d.relType] : undefined;
        return s ? s.width : 1;
      })
      .attr('stroke-dasharray', (d: SimLink) => {
        const s = d.relType ? EDGE_STYLES[d.relType] : undefined;
        return s ? s.dash : '';
      });

    // Arrow markers for CREATED edges
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 20).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L10,5 L0,10 z').attr('fill', '#AAAACC');

    link.filter((d: SimLink) => d.relType === EdgeRelationshipType.CREATED)
      .attr('marker-end', 'url(#arrow)');

    const node = g.selectAll('.node').data(simNodes).enter().append('g')
      .attr('class', 'cursor-pointer')
      .on('click', (_e: MouseEvent, d: SimNode) => setSelectedNode(d.id))
      .on('dblclick', (_e: MouseEvent, _d: SimNode) => {
        if (drillLevel < 4) setDrillLevel((l) => Math.min(4, l + 1) as DrillLevel);
      })
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Node size by importance
    node.append('circle')
      .attr('r', (d: SimNode) => 6 + (d.importance ?? 0.5) * 8)
      .attr('fill', (d: SimNode) => NODE_COLORS[d.nodeType] ?? '#888899')
      .attr('stroke', (d: SimNode) => NODE_COLORS[d.nodeType] ?? '#888899')
      .attr('stroke-width', 2)
      .attr('fill-opacity', 0.2);

    // Tooltip
    node.append('title')
      .text((d: SimNode) => d.label);

    node.append('text')
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#AAAACC')
      .attr('font-size', '10px')
      .text((d: SimNode) => d.label ?? d.id.slice(0, 8));

    sim.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: SimNode) => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 5]).on('zoom', (event) => {
      g.attr('transform', event.transform.toString());
    });
    svg.call(zoom);

    return () => { sim.stop(); };
  }, [viewMode, mapNodes, timelineEdges, drillLevel]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const selectedTimelineNode = timelineNodes.find((n) => n.id === selectedNode);
  const selectedMapNode = mapNodes.find((n) => n.id === selectedNode);

  const breadcrumbItems = [
    { label: 'Results', onClick: () => navigate('/results') },
    { label: concept?.name ?? 'Explorer', onClick: drillLevel > 0 ? () => setDrillLevel(0) : undefined },
    ...(drillLevel >= 1 ? [{ label: DRILL_LABELS[1], onClick: drillLevel > 1 ? () => setDrillLevel(1) : undefined }] : []),
    ...(drillLevel >= 2 ? [{ label: DRILL_LABELS[2], onClick: drillLevel > 2 ? () => setDrillLevel(2) : undefined }] : []),
    ...(drillLevel >= 3 ? [{ label: DRILL_LABELS[3], onClick: drillLevel > 3 ? () => setDrillLevel(3) : undefined }] : []),
    ...(drillLevel >= 4 ? [{ label: DRILL_LABELS[4] }] : []),
  ];

  // -------------------------------------------------------------------------
  // FE-9.3: Detail panel content by drill level
  // -------------------------------------------------------------------------

  function renderDetailPanel() {
    // If a node is selected, show node info overlaid on level content
    const nodeInfo = renderSelectedNodeInfo();

    switch (drillLevel) {
      // L0: Cluster statistics
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Cluster Statistics</h3>
            {clusters.length > 0 ? (
              clusters.map((cl) => (
                <div key={cl.id} className="border-b border-[var(--bg-tertiary)] pb-2">
                  <p className="text-sm font-medium">{cl.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{cl.conceptIds.length} concepts</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">No cluster data available.</p>
            )}
            {concept && (
              <div className="pt-2">
                <p className="text-sm text-[var(--text-secondary)]">{concept.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="cyan">{concept.abstractionLevel}</Badge>
                  {concept.domain && <Badge variant="blue">{concept.domain}</Badge>}
                </div>
              </div>
            )}
            {nodeInfo}
          </div>
        );

      // L1: Full report summary, validity scores
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Report Summary</h3>
            {analysis ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant={analysis.validityTier === 'T1' ? 'green' : analysis.validityTier === 'T2' ? 'yellow' : analysis.validityTier === 'T3' ? 'orange' : 'red'}>
                    {analysis.validityTier}
                  </Badge>
                  <span className="text-sm font-medium">Score: {analysis.compositeScore}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{analysis.qualitativeReport.executiveSummary}</p>
                <div className="space-y-2">
                  <ProgressBar label="Market Viability" value={analysis.marketViability.score} max={100} variant="green" />
                  <ProgressBar label="Technical Feasibility" value={analysis.technicalFeasibility.score} max={100} variant="cyan" />
                  <ProgressBar label="Investment Potential" value={analysis.investmentPotential.score} max={100} variant="magenta" />
                </div>
                {analysis.qualitativeReport.keyRisks.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Key Risks</p>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.qualitativeReport.keyRisks.map((r, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)]">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">No analysis available. Run Market Analysis first.</p>
            )}
            {nodeInfo}
          </div>
        );

      // L2: Component details, relationships
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Components &amp; Relationships</h3>
            {concept && (
              <>
                {concept.themes && concept.themes.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Themes</p>
                    <div className="flex flex-wrap gap-1">
                      {concept.themes.map((t, i) => (
                        <Badge key={i} variant="blue">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {relatedConcepts.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Related Concepts</p>
                    <div className="space-y-1">
                      {relatedConcepts.map((rc) => (
                        <button
                          key={rc.id}
                          className="block text-sm text-[var(--accent-nav)] hover:underline text-left"
                          onClick={() => navigate(`/explore/${rc.id}`)}
                        >
                          {rc.name} <span className="text-[var(--text-tertiary)]">({rc.abstractionLevel})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {assets.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Generated Assets</p>
                    <div className="space-y-1">
                      {assets.map((a) => (
                        <p key={a.id} className="text-xs text-[var(--text-secondary)]">{a.assetType}</p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {nodeInfo}
          </div>
        );

      // L3: Technical data (adaptive depth)
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Technical Specifications</h3>
            {analysis ? (
              <>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Market Viability Breakdown</p>
                  <p className="text-xs text-[var(--text-secondary)]">{analysis.marketViability.analysis}</p>
                  {Object.entries(analysis.marketViability.factors).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs mt-1">
                      <span className="text-[var(--text-tertiary)] capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-[var(--text-secondary)]">{v}/100</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Technical Feasibility Breakdown</p>
                  <p className="text-xs text-[var(--text-secondary)]">{analysis.technicalFeasibility.analysis}</p>
                  {Object.entries(analysis.technicalFeasibility.factors).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs mt-1">
                      <span className="text-[var(--text-tertiary)] capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-[var(--text-secondary)]">{v}/100</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Investment Potential Breakdown</p>
                  <p className="text-xs text-[var(--text-secondary)]">{analysis.investmentPotential.analysis}</p>
                  {Object.entries(analysis.investmentPotential.factors).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs mt-1">
                      <span className="text-[var(--text-tertiary)] capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-[var(--text-secondary)]">{v}/100</span>
                    </div>
                  ))}
                </div>
                {analysis.qualitativeReport.recommendedNextSteps.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Recommended Next Steps</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {analysis.qualitativeReport.recommendedNextSteps.map((s, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)]">{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">No technical data available. Run analysis first.</p>
            )}
            {nodeInfo}
          </div>
        );

      // L4: Source excerpt with full context
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Source Material</h3>
            {concept?.sourceReferences && concept.sourceReferences.length > 0 ? (
              concept.sourceReferences.map((ref, i) => (
                <div key={i} className="border border-[var(--bg-tertiary)] rounded-[var(--radius-sm)] p-3">
                  <p className="text-sm font-medium">{ref.fileName}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">{ref.location}</p>
                  {ref.excerpt && (
                    <blockquote className="border-l-2 border-[var(--accent-nav)] pl-3 text-xs text-[var(--text-secondary)] italic">
                      {ref.excerpt}
                    </blockquote>
                  )}
                  {ref.context && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-2">{ref.context}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">No source excerpts available.</p>
            )}
            {analysis?.evidenceCitations && analysis.evidenceCitations.length > 0 && (
              <div>
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Evidence Citations</p>
                {analysis.evidenceCitations.map((c, i) => (
                  <p key={i} className="text-xs text-[var(--text-secondary)] mb-1">[{i + 1}] {c.sourceTitle}: {c.snippet}</p>
                ))}
              </div>
            )}
          </div>
        );
    }
  }

  /** Render info about the currently selected node (overlay on any level) */
  function renderSelectedNodeInfo() {
    if (!selectedNode) return null;
    const tNode = selectedTimelineNode;
    const mNode = selectedMapNode;
    if (!tNode && !mNode) return null;

    return (
      <div className="border-t border-[var(--bg-tertiary)] pt-3 mt-3">
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Selected Node</p>
        {tNode && (
          <div className="space-y-1">
            <p className="text-sm"><strong>{TIMELINE_NODE_SHAPES[tNode.nodeType]}</strong> {tNode.label}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{tNode.nodeType}</p>
            {tNode.description && <p className="text-xs text-[var(--text-secondary)]">{tNode.description}</p>}
            {tNode.date && <p className="text-xs text-[var(--text-tertiary)]">{new Date(tNode.date).toLocaleDateString()} ({tNode.datePrecision})</p>}
          </div>
        )}
        {mNode && !tNode && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[mNode.nodeType] }} />
              <p className="text-sm font-medium">{mNode.label}</p>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">{mNode.nodeType}</p>
            {mNode.description && <p className="text-xs text-[var(--text-secondary)]">{mNode.description}</p>}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // FE-10.2: Primary panel rendering by content type
  // -------------------------------------------------------------------------

  function renderPrimaryPanel() {
    switch (contentType) {
      case 'concept-overview':
        // L0: show visualization if available, otherwise concept summary
        if ((viewMode === 'tree' && timelineNodes.length > 0) || (viewMode === 'map' && mapNodes.length > 0)) {
          return renderVisualizationCanvas();
        }
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{concept?.name}</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">{concept?.description}</p>
            <div className="flex gap-2">
              <Badge variant="cyan">{concept?.abstractionLevel}</Badge>
              {concept?.domain && <Badge variant="blue">{concept.domain}</Badge>}
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">No visualization data. Run Market Analysis to generate timeline and node map data.</p>
          </div>
        );

      case 'analysis-report':
        // L1 with analysis: scrollable report text in primary panel
        return (
          <div className="p-6 overflow-y-auto h-full">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{concept?.name} — Analysis Report</h2>
            {analysis && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Executive Summary</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{analysis.qualitativeReport.executiveSummary}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <ScoreCard label="Market" score={analysis.marketViability.score} />
                  <ScoreCard label="Technical" score={analysis.technicalFeasibility.score} />
                  <ScoreCard label="Investment" score={analysis.investmentPotential.score} />
                </div>
                {analysis.qualitativeReport.keyRisks.length > 0 && (
                  <div>
                    <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Key Risks</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.qualitativeReport.keyRisks.map((r, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)]">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.qualitativeReport.recommendedNextSteps.length > 0 && (
                  <div>
                    <h3 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Next Steps</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      {analysis.qualitativeReport.recommendedNextSteps.map((s, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)]">{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'source-material':
        // L4: Document viewer with highlighted passages
        return (
          <div className="p-6 overflow-y-auto h-full">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Source Material</h2>
            {concept?.sourceReferences && concept.sourceReferences.length > 0 ? (
              <div className="space-y-6">
                {concept.sourceReferences.map((ref, i) => (
                  <div key={i} className="border border-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-mono bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">{ref.fileName}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{ref.location}</span>
                    </div>
                    {ref.excerpt && (
                      <blockquote className="border-l-2 border-[var(--accent-nav)] pl-4 py-2 text-sm text-[var(--text-secondary)] italic bg-[var(--bg-secondary)] rounded-r">
                        "{ref.excerpt}"
                      </blockquote>
                    )}
                    {ref.context && (
                      <p className="text-xs text-[var(--text-tertiary)] mt-3">{ref.context}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">No source material available.</p>
            )}
          </div>
        );

      case 'generated-asset': {
        // Show asset preview with provenance
        const selMap = mapNodes.find((n) => n.id === selectedNode);
        const assetId = selMap?.metadata?.assetId;
        const asset = assets.find((a) => a.id === assetId);
        return (
          <div className="p-6 overflow-y-auto h-full">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {asset ? asset.assetType.replace(/_/g, ' ') : 'Generated Asset'}
            </h2>
            {asset ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)]">Asset type: {asset.assetType}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Generated: {new Date(asset.generatedTimestamp).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">Select an asset node to preview.</p>
            )}
          </div>
        );
      }

      case 'visualization':
      default:
        return renderVisualizationCanvas();
    }
  }

  /** Render the D3 canvas with toggle and zoom controls */
  function renderVisualizationCanvas() {
    return (
      <div className="relative w-full h-full">
        {/* View toggle */}
        <div className="absolute top-3 left-3 z-10 flex gap-1">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 text-xs rounded-[var(--radius-sm)] border transition-colors ${viewMode === 'tree' ? 'border-[var(--accent-nav)] text-[var(--accent-nav)]' : 'border-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}
          >
            Tree
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-xs rounded-[var(--radius-sm)] border transition-colors ${viewMode === 'map' ? 'border-[var(--accent-nav)] text-[var(--accent-nav)]' : 'border-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}
          >
            Map
          </button>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <button
            className="w-7 h-7 flex items-center justify-center text-xs border border-[var(--bg-tertiary)] text-[var(--text-tertiary)] rounded hover:border-[var(--accent-nav)] hover:text-[var(--accent-nav)] transition-colors"
            onClick={() => {
              const ref = viewMode === 'tree' ? treeRef.current : mapRef.current;
              if (ref) d3.select(ref).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.3);
            }}
          >+</button>
          <button
            className="w-7 h-7 flex items-center justify-center text-xs border border-[var(--bg-tertiary)] text-[var(--text-tertiary)] rounded hover:border-[var(--accent-nav)] hover:text-[var(--accent-nav)] transition-colors"
            onClick={() => {
              const ref = viewMode === 'tree' ? treeRef.current : mapRef.current;
              if (ref) d3.select(ref).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.7);
            }}
          >−</button>
          <button
            className="w-7 h-7 flex items-center justify-center text-xs border border-[var(--bg-tertiary)] text-[var(--text-tertiary)] rounded hover:border-[var(--accent-nav)] hover:text-[var(--accent-nav)] transition-colors"
            onClick={() => {
              const ref = viewMode === 'tree' ? treeRef.current : mapRef.current;
              if (ref) d3.select(ref).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
            }}
          >⌂</button>
        </div>

        {viewMode === 'tree' ? (
          timelineNodes.length > 0 ? (
            <svg ref={treeRef} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-tertiary)]">No timeline data. Run analysis first.</div>
          )
        ) : (
          mapNodes.length > 0 ? (
            <svg ref={mapRef} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-tertiary)]">No node map data. Run analysis first.</div>
          )
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 border-2 border-[var(--accent-nav)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!concept) {
    return <div className="text-center py-16 text-[var(--text-tertiary)]">Concept not found</div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header: breadcrumb + controls */}
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-2">
          <Badge variant="cyan">L{drillLevel}</Badge>
          {drillLevel < 4 && (
            <Button variant="secondary" onClick={() => setDrillLevel((l) => Math.min(4, l + 1) as DrillLevel)}>
              {DRILL_BUTTON_LABELS[drillLevel]}
            </Button>
          )}
          {drillLevel > 0 && (
            <Button variant="secondary" onClick={() => setDrillLevel((l) => Math.max(0, l - 1) as DrillLevel)}>
              Back Up
            </Button>
          )}
        </div>
      </div>

      {/* Three-zone layout: primary + secondary (side) + tertiary (bottom strip) */}
      <div className="flex-1 grid grid-cols-[1fr_320px] grid-rows-[1fr_120px] gap-4">
        {/* Primary panel — media-reactive (FE-10.2) */}
        <Card className="relative overflow-hidden">
          {renderPrimaryPanel()}
        </Card>

        {/* Secondary panel — context-sensitive detail (FE-9.3) */}
        <Card className="row-span-2 overflow-y-auto p-4">
          <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            {DRILL_LABELS[drillLevel]}
          </h2>
          {renderDetailPanel()}
        </Card>

        {/* Tertiary strip — source excerpts (FE-9.4) */}
        <Card className="overflow-x-auto">
          <div className="flex gap-3 h-full items-start">
            {concept.sourceReferences && concept.sourceReferences.length > 0 ? (
              concept.sourceReferences.map((ref, i) => (
                <button
                  key={i}
                  className="shrink-0 w-48 text-xs text-left hover:bg-[var(--bg-tertiary)] rounded p-2 transition-colors"
                  onClick={() => setDrillLevel(4)}
                >
                  <p className="font-medium truncate">{ref.fileName}</p>
                  <p className="text-[var(--text-tertiary)]">{ref.location}</p>
                  {ref.excerpt && <p className="text-[var(--text-secondary)] line-clamp-2 mt-1">{ref.excerpt}</p>}
                </button>
              ))
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">No source excerpts</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreCard({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? 'var(--accent-valid)' : score >= 50 ? '#FFCC00' : score >= 25 ? 'var(--accent-warn)' : '#FF4444';
  return (
    <div className="border border-[var(--bg-tertiary)] rounded-[var(--radius-sm)] p-3 text-center">
      <p className="text-xs text-[var(--text-tertiary)] mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{score}</p>
    </div>
  );
}
