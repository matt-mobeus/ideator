import type { Concept } from '@/types/concept.ts'
import type {
  NodeMapNode,
  NodeMapEdge,
  NodeMapNodeType,
  EdgeStyle,
  VisualizationData,
} from '@/types/visualization.ts'
import type { LlmProvider } from '@/network/llm/types.ts'
import { executePrompt } from '@/network/prompt-execution.service.ts'
import { searchWeb } from '@/network/search/index.ts'
import { storage } from '@/services/storage.service.ts'
import { generateTimeline } from '@/services/timeline-data.service.ts'
import { logger } from '@/utils/logger'

interface NodeMapPromptNode {
  label: string
  nodeType: NodeMapNodeType
  metadata?: Record<string, unknown>
}

interface NodeMapPromptEdge {
  sourceLabel: string
  targetLabel: string
  edgeStyle: EdgeStyle
  label?: string
}

interface NodeMapPromptResponse {
  nodes: NodeMapPromptNode[]
  edges: NodeMapPromptEdge[]
}

export function buildNodeMapPrompt(
  concept: Concept,
  searchContext?: string,
): { system: string; user: string } {
  const system = `You are an expert in conceptual ecosystem mapping. Given a concept, identify its surrounding ecosystem including:
- Related concepts and theories
- Key patents and intellectual property
- Important publications and papers
- Notable people and researchers
- Companies and organizations
- Significant events and milestones

Return a JSON object with:
- nodes: array of ecosystem nodes with fields:
  * label: name/title of the entity
  * nodeType: one of "concept" | "patent" | "publication" | "person" | "company" | "event"
  * metadata: optional object with additional details (e.g., year, author, url, description)

- edges: array of connections with fields:
  * sourceLabel: label of source node
  * targetLabel: label of target node
  * edgeStyle: one of "solid" | "dashed" | "dotted"
  * label: optional label describing the relationship

Create a comprehensive but focused map showing the most important connections and entities.`

  let userPrompt = `Map the ecosystem for this concept:

Name: ${concept.name}
Description: ${concept.description}
Domain: ${concept.domain || 'Not specified'}
${concept.themes?.length ? `Themes: ${concept.themes.join(', ')}` : ''}
${concept.sourceReferences?.length ? `References: ${concept.sourceReferences.map((r) => r.fileName).join(', ')}` : ''}`

  if (searchContext) {
    userPrompt += `\n\nAdditional Context from Web Search:\n${searchContext}`
  }

  userPrompt += '\n\nGenerate a comprehensive ecosystem map showing key entities and their relationships.'

  return { system, user: userPrompt }
}

export async function generateNodeMap(
  concept: Concept,
  provider: LlmProvider,
): Promise<{ nodes: NodeMapNode[]; edges: NodeMapEdge[] }> {
  try {
    // Optionally gather web context
    let searchContext: string | undefined
    try {
      const settings = await storage.getById<{ id: string; serperApiKey?: string }>('settings', 'app-settings')
      const apiKey = settings?.serperApiKey || ''
      const searchResults = await searchWeb({ query: concept.name }, apiKey)
      if (searchResults.length > 0) {
        searchContext = searchResults
          .slice(0, 5)
          .map((r) => `${r.title}: ${r.snippet}`)
          .join('\n')
      }
    } catch (error) {
      logger.warn('Web search failed, continuing without context:', error)
    }

    const { system, user } = buildNodeMapPrompt(concept, searchContext)

    const response = await executePrompt(provider, system, user, { jsonMode: true })

    // Strip markdown code fences if present
    let jsonText = response.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '')
    }

    const data = JSON.parse(jsonText) as NodeMapPromptResponse

    // Map nodes with UUIDs and positions
    const nodes: NodeMapNode[] = data.nodes.map((node) => ({
      id: crypto.randomUUID(),
      label: node.label,
      nodeType: node.nodeType,
      position: { x: 0, y: 0 },
      metadata: Object.fromEntries(
        Object.entries(node.metadata || {}).map(([k, v]) => [k, String(v)])
      ),
    }))

    // Create label to ID map for edge mapping
    const labelToId = new Map<string, string>()
    nodes.forEach((node) => labelToId.set(node.label, node.id))

    // Map edges with UUIDs
    const edges: NodeMapEdge[] = data.edges
      .map((edge) => {
        const sourceId = labelToId.get(edge.sourceLabel)
        const targetId = labelToId.get(edge.targetLabel)

        if (!sourceId || !targetId) {
          logger.warn(
            `Node map edge references unknown node: ${edge.sourceLabel} -> ${edge.targetLabel}`,
          )
          return null
        }

        return {
          id: crypto.randomUUID(),
          sourceId: sourceId,
          targetId: targetId,
          edgeStyle: edge.edgeStyle,
          label: edge.label,
        }
      })
      .filter((e) => e !== null) as NodeMapEdge[]

    return { nodes, edges }
  } catch (error) {
    logger.error('Failed to generate node map:', error)
    throw new Error(
      `Node map generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

export async function generateVisualizationData(
  concept: Concept,
  provider: LlmProvider,
): Promise<VisualizationData> {
  try {
    // Generate both visualizations in parallel
    const [timeline, nodeMap] = await Promise.all([
      generateTimeline(concept, provider),
      generateNodeMap(concept, provider),
    ])

    const visualizationData: VisualizationData = {
      id: crypto.randomUUID(),
      conceptId: concept.id,
      timelineNodes: timeline.nodes,
      timelineEdges: timeline.edges,
      nodeMapNodes: nodeMap.nodes,
      nodeMapEdges: nodeMap.edges,
      generatedAt: new Date(),
    }

    // Store visualization data
    await storage.put('visualizations', visualizationData)

    return visualizationData
  } catch (error) {
    logger.error('Failed to generate visualization data:', error)
    throw new Error(
      `Visualization data generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
