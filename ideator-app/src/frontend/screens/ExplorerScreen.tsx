// ============================================================================
// IDEATOR — Screen 6: Concept Explorer (FE-9.x, FE-10.x, FE-11.x)
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { Button, Badge } from '../components/primitives';
import { Card, Breadcrumb, Tabs } from '../components/composite';
import { useAppState } from '../contexts/AppStateContext';
import type { Concept, TimelineNode, TimelineEdge, MapNode } from '../../shared/types';
import { TimelineNodeType, MapNodeType } from '../../shared/types';

type DrillLevel = 0 | 1 | 2 | 3 | 4;

const DRILL_LABELS: Record<DrillLevel, string> = { 0: 'Overview', 1: 'Details', 2: 'Components', 3: 'Technical', 4: 'Source' };

// D3 color map for node types
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

export function ExplorerScreen() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const { storage } = useAppState();
  const [concept, setConcept] = useState<Concept | null>(null);
  const [drillLevel, setDrillLevel] = useState<DrillLevel>(0);
  const [viewMode, setViewMode] = useState<'tree' | 'map'>('tree');
  const [timelineNodes, setTimelineNodes] = useState<TimelineNode[]>([]);
  const [timelineEdges, setTimelineEdges] = useState<TimelineEdge[]>([]);
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const treeRef = useRef<SVGSVGElement>(null);
  const mapRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    (async () => {
      if (!conceptId) return;
      const c = await storage.getConcept(conceptId);
      setConcept(c ?? null);
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

  // D3 tree visualization
  useEffect(() => {
    if (viewMode !== 'tree' || !treeRef.current || timelineNodes.length === 0) return;
    const svg = d3.select(treeRef.current);
    svg.selectAll('*').remove();
    const width = treeRef.current.clientWidth || 800;
    const height = treeRef.current.clientHeight || 400;
    const g = svg.append('g').attr('transform', `translate(40, ${height / 2})`);

    // Simple horizontal layout
    const xScale = d3.scaleLinear().domain([0, timelineNodes.length - 1]).range([0, width - 80]);

    // Draw edges
    timelineEdges.forEach((edge) => {
      const sourceIdx = timelineNodes.findIndex((n) => n.id === edge.sourceNodeId);
      const targetIdx = timelineNodes.findIndex((n) => n.id === edge.targetNodeId);
      if (sourceIdx >= 0 && targetIdx >= 0) {
        g.append('line')
          .attr('x1', xScale(sourceIdx)).attr('y1', 0)
          .attr('x2', xScale(targetIdx)).attr('y2', 0)
          .attr('stroke', '#333355').attr('stroke-width', 1.5)
          .attr('stroke-dasharray', edge.relationshipType === 'PROJECTED' ? '4,4' : 'none');
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

    nodes.append('text')
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#AAAACC')
      .attr('font-size', '10px')
      .text((d: TimelineNode) => d.label ?? d.id.slice(0, 8));

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 3]).on('zoom', (event) => {
      g.attr('transform', event.transform.toString());
    });
    svg.call(zoom);
  }, [viewMode, timelineNodes, timelineEdges]);

  // D3 force-directed node map
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
    }

    const simNodes: SimNode[] = mapNodes.map((n) => ({ id: n.id, nodeType: n.nodeType, label: n.label, x: width / 2, y: height / 2 }));
    const simLinks: d3.SimulationLinkDatum<SimNode>[] = [];

    // Create links between consecutive nodes for demo
    for (let i = 1; i < simNodes.length; i++) {
      simLinks.push({ source: simNodes[i - 1].id, target: simNodes[i].id });
    }

    const sim = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const g = svg.append('g');

    const link = g.selectAll('.link').data(simLinks).enter().append('line')
      .attr('stroke', '#333355').attr('stroke-width', 1);

    const node = g.selectAll('.node').data(simNodes).enter().append('g')
      .attr('class', 'cursor-pointer')
      .on('click', (_e: MouseEvent, d: SimNode) => setSelectedNode(d.id))
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    node.append('circle')
      .attr('r', 10)
      .attr('fill', (d: SimNode) => NODE_COLORS[d.nodeType] ?? '#888899')
      .attr('stroke', (d: SimNode) => NODE_COLORS[d.nodeType] ?? '#888899')
      .attr('stroke-width', 2)
      .attr('fill-opacity', 0.2);

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
  }, [viewMode, mapNodes]);

  const breadcrumbItems = [
    { label: 'Results', onClick: () => navigate('/results') },
    { label: concept?.name ?? 'Explorer', onClick: drillLevel > 0 ? () => setDrillLevel(0) : undefined },
    ...(drillLevel > 0 ? [{ label: DRILL_LABELS[drillLevel] }] : []),
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <span className="animate-spin h-8 w-8 border-2 border-[var(--accent-nav)] border-t-transparent rounded-full" />
    </div>;
  }

  if (!concept) {
    return <div className="text-center py-16 text-[var(--text-tertiary)]">Concept not found</div>;
  }

  const selectedTimelineNode = timelineNodes.find((n) => n.id === selectedNode);
  const selectedMapNode = mapNodes.find((n) => n.id === selectedNode);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-2">
          <Badge variant="cyan">L{drillLevel}</Badge>
          {drillLevel < 4 && (
            <Button variant="secondary" onClick={() => setDrillLevel((l) => Math.min(4, l + 1) as DrillLevel)}>
              Drill Down
            </Button>
          )}
          {drillLevel > 0 && (
            <Button variant="secondary" onClick={() => setDrillLevel((l) => Math.max(0, l - 1) as DrillLevel)}>
              Back Up
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_320px] grid-rows-[1fr_120px] gap-4">
        {/* Visualization canvas */}
        <Card className="relative overflow-hidden">
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
        </Card>

        {/* Detail panel */}
        <Card className="row-span-2 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            {DRILL_LABELS[drillLevel]} — Details
          </h2>

          {selectedNode ? (
            <div className="space-y-3">
              {selectedTimelineNode && (
                <>
                  <p className="text-sm"><strong>Type:</strong> {TIMELINE_NODE_SHAPES[selectedTimelineNode.nodeType]} {selectedTimelineNode.nodeType}</p>
                  <p className="text-sm"><strong>Label:</strong> {selectedTimelineNode.label}</p>
                  {selectedTimelineNode.date && <p className="text-sm"><strong>Date:</strong> {new Date(selectedTimelineNode.date).toLocaleDateString()}</p>}
                </>
              )}
              {selectedMapNode && (
                <>
                  <p className="text-sm"><strong>Type:</strong> {selectedMapNode.nodeType}</p>
                  <p className="text-sm"><strong>Label:</strong> {selectedMapNode.label}</p>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[selectedMapNode.nodeType] }} />
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">{concept.description}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="cyan">{concept.abstractionLevel}</Badge>
                {concept.domain && <Badge variant="blue">{concept.domain}</Badge>}
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">Click a node to view details</p>
            </div>
          )}
        </Card>

        {/* Source strip */}
        <Card className="overflow-x-auto">
          <div className="flex gap-3 h-full items-start">
            {concept.sourceReferences && concept.sourceReferences.length > 0 ? (
              concept.sourceReferences.map((ref, i) => (
                <div key={i} className="shrink-0 w-48 text-xs">
                  <p className="font-medium truncate">{ref.fileName}</p>
                  <p className="text-[var(--text-tertiary)]">{ref.location}</p>
                  {ref.excerpt && <p className="text-[var(--text-secondary)] line-clamp-2 mt-1">{ref.excerpt}</p>}
                </div>
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
