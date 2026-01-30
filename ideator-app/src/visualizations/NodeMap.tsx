import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import type { NodeMapNode, NodeMapEdge, EdgeStyle, NodeMapNodeType } from '../types/visualization'
import { nodeTypeColor, edgeColor } from './shared/color-scales'

interface NodeMapProps {
  data: { nodes: NodeMapNode[]; edges: NodeMapEdge[] }
  onNodeSelect?: (node: NodeMapNode) => void
  onNodeDoubleClick?: (node: NodeMapNode) => void
  onNodeHover?: (node: NodeMapNode | null) => void
}

const NODE_R = 16

interface SimNode extends d3.SimulationNodeDatum {
  data: NodeMapNode
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  data: NodeMapEdge
}

function nodeShape(type: NodeMapNodeType, r: number): string {
  switch (type) {
    case 'CONCEPT':
      return d3.range(6).map(i => {
        const a = (Math.PI / 3) * i - Math.PI / 2
        return `${i === 0 ? 'M' : 'L'}${Math.cos(a) * r},${Math.sin(a) * r}`
      }).join(' ') + ' Z'
    case 'PATENT':
      return d3.range(5).map(i => {
        const a = (2 * Math.PI / 5) * i - Math.PI / 2
        return `${i === 0 ? 'M' : 'L'}${Math.cos(a) * r},${Math.sin(a) * r}`
      }).join(' ') + ' Z'
    case 'PUBLICATION':
      return `M${-r},${-r * 0.7} L${r},${-r * 0.7} L${r},${r * 0.7} L${-r},${r * 0.7} Z`
    case 'PERSON':
      return d3.arc()({ innerRadius: 0, outerRadius: r, startAngle: 0, endAngle: 2 * Math.PI }) ?? ''
    case 'COMPANY':
      return `M${-r},${-r} L${r},${-r} L${r},${r} L${-r},${r} Z`
    case 'EVENT':
      return `M0,${-r} L${r},0 L0,${r} L${-r},0 Z`
    default:
      return ''
  }
}

function edgeDash(style: EdgeStyle): string {
  switch (style) {
    case 'CREATED': return ''
    case 'REFERENCED': return '2,3'
    case 'FUNDED_EDGE': return '6,4'
    case 'AFFILIATED': return ''
    case 'COMPETED_EDGE': return '5,3'
    default: return ''
  }
}

function edgeWidth(style: EdgeStyle): number {
  return style === 'AFFILIATED' ? 1 : 1.5
}

export const NodeMap: React.FC<NodeMapProps> = ({ data, onNodeSelect, onNodeDoubleClick, onNodeHover }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null)

  const render = useCallback(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    const svg = d3.select<SVGSVGElement, unknown>(svgEl)
    svg.selectAll('*').remove()
    if (simRef.current) simRef.current.stop()

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

    const simNodes: SimNode[] = data.nodes.map(n => ({
      data: n,
      x: n.position.x || width / 2,
      y: n.position.y || height / 2,
    }))
    const nodeById = new Map(simNodes.map(n => [n.data.id, n]))

    const simLinks: SimLink[] = data.edges
      .filter(e => nodeById.has(e.sourceId) && nodeById.has(e.targetId))
      .map(e => ({
        source: nodeById.get(e.sourceId)!,
        target: nodeById.get(e.targetId)!,
        data: e,
      }))

    const simulation = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(NODE_R + 4))
    simRef.current = simulation

    const linkSel = g.selectAll<SVGLineElement, SimLink>('line.edge')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('stroke', (d: SimLink) => edgeColor(d.data.edgeStyle))
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', (d: SimLink) => edgeWidth(d.data.edgeStyle))
      .attr('stroke-dasharray', (d: SimLink) => edgeDash(d.data.edgeStyle))

    const nodeG = g.selectAll<SVGGElement, SimNode>('g.node')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')

    nodeG.append('path')
      .attr('d', (d: SimNode) => nodeShape(d.data.nodeType, NODE_R))
      .attr('fill', (d: SimNode) => nodeTypeColor(d.data.nodeType))
      .attr('fill-opacity', 0.2)
      .attr('stroke', (d: SimNode) => nodeTypeColor(d.data.nodeType))
      .attr('stroke-width', 1.5)

    nodeG.append('text')
      .attr('dy', NODE_R + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', 11)
      .text((d: SimNode) => d.data.label)

    nodeG
      .on('click', (_e: MouseEvent, d: SimNode) => onNodeSelect?.(d.data))
      .on('dblclick', (_e: MouseEvent, d: SimNode) => onNodeDoubleClick?.(d.data))
      .on('mouseenter', (_e: MouseEvent, d: SimNode) => onNodeHover?.(d.data))
      .on('mouseleave', () => onNodeHover?.(null))

    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x; d.fy = d.y
      })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null; d.fy = null
      })
    nodeG.call(drag)

    simulation.on('tick', () => {
      linkSel
        .attr('x1', (d: SimLink) => (d.source as SimNode).x!)
        .attr('y1', (d: SimLink) => (d.source as SimNode).y!)
        .attr('x2', (d: SimLink) => (d.target as SimNode).x!)
        .attr('y2', (d: SimLink) => (d.target as SimNode).y!)
      nodeG.attr('transform', (d: SimNode) => `translate(${d.x},${d.y})`)
    })
  }, [data, onNodeSelect, onNodeDoubleClick, onNodeHover])

  useEffect(() => {
    render()
    const ro = new ResizeObserver(render)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => { ro.disconnect(); simRef.current?.stop() }
  }, [render])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg-primary)' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
