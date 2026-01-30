import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import type { TimelineNode, TimelineEdge, TimelineNodeType, RelationshipType } from '../types/visualization'
import { timelineNodeColor } from './shared/color-scales'

interface BranchingTreeProps {
  data: { nodes: TimelineNode[]; edges: TimelineEdge[] }
  onNodeSelect?: (node: TimelineNode) => void
  onNodeHover?: (node: TimelineNode | null) => void
}

const NODE_SIZE = 14

function nodePath(type: TimelineNodeType, s: number): string {
  const h = s / 2
  switch (type) {
    case 'ORIGIN':
    case 'PROJECTED':
      return d3.arc()({ innerRadius: 0, outerRadius: h, startAngle: 0, endAngle: 2 * Math.PI }) ?? ''
    case 'VARIATION':
      return `M0,${-h} L${h},0 L0,${h} L${-h},0 Z`
    case 'MERGE':
      return d3.range(6).map(i => {
        const a = (Math.PI / 3) * i - Math.PI / 2
        return `${i === 0 ? 'M' : 'L'}${Math.cos(a) * h},${Math.sin(a) * h}`
      }).join(' ') + ' Z'
    case 'CURRENT':
      return `M${-h},${-h} L${h},${-h} L${h},${h} L${-h},${h} Z`
    default:
      return ''
  }
}

function edgeDash(type: RelationshipType): string {
  switch (type) {
    case 'DERIVED': return ''
    case 'MERGED': return '6,3'
    case 'INFLUENCED': return '3,3'
    case 'CITED': return '1,3'
    case 'FUNDED': return '8,4'
    case 'COMPETED': return '4,2,1,2'
    default: return ''
  }
}

export const BranchingTree: React.FC<BranchingTreeProps> = ({ data, onNodeSelect, onNodeHover }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const render = useCallback(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    const svg = d3.select<SVGSVGElement, unknown>(svgEl)
    svg.selectAll('*').remove()

    const container = containerRef.current
    if (!container) return
    const width = container.clientWidth
    const height = container.clientHeight

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const g = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => g.attr('transform', event.transform))
    svg.call(zoom)

    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 6')
      .attr('refX', 10).attr('refY', 3)
      .attr('markerWidth', 8).attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L10,3 L0,6 Z')
      .attr('fill', 'var(--color-cyan)')

    const nodeMap = new Map(data.nodes.map(n => [n.id, n]))

    // Edges
    g.selectAll<SVGPathElement, TimelineEdge>('path.edge')
      .data(data.edges)
      .enter()
      .append('path')
      .attr('class', 'edge')
      .attr('d', (d: TimelineEdge) => {
        const src = nodeMap.get(d.sourceNodeId)
        const tgt = nodeMap.get(d.targetNodeId)
        if (!src || !tgt) return ''
        return `M${src.position.x},${src.position.y} L${tgt.position.x},${tgt.position.y}`
      })
      .attr('stroke', 'var(--color-cyan)')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d: TimelineEdge) => edgeDash(d.relationshipType))
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)')

    // Nodes
    const nodeG = g.selectAll<SVGGElement, TimelineNode>('g.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: TimelineNode) => `translate(${d.position.x},${d.position.y})`)
      .style('cursor', 'pointer')

    nodeG.append('path')
      .attr('d', (d: TimelineNode) => nodePath(d.nodeType, NODE_SIZE))
      .attr('fill', (d: TimelineNode) => timelineNodeColor(d.nodeType))
      .attr('fill-opacity', 0.25)
      .attr('stroke', (d: TimelineNode) => timelineNodeColor(d.nodeType))
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d: TimelineNode) => d.nodeType === 'PROJECTED' ? '3,2' : '')

    nodeG.append('text')
      .attr('dy', NODE_SIZE + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', 11)
      .text((d: TimelineNode) => d.label)

    nodeG.on('click', (_event: MouseEvent, d: TimelineNode) => onNodeSelect?.(d))
      .on('mouseenter', (_event: MouseEvent, d: TimelineNode) => onNodeHover?.(d))
      .on('mouseleave', () => onNodeHover?.(null))
  }, [data, onNodeSelect, onNodeHover])

  useEffect(() => {
    render()
    const ro = new ResizeObserver(render)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [render])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg-primary)' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
