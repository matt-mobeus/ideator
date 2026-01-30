import type { Concept } from '@/types/concept.ts'
import type {
  TimelineNode,
  TimelineEdge,
  TimelineNodeType,
  DatePrecision,
  RelationshipType,
} from '@/types/visualization.ts'
import type { LlmProvider } from '@/network/llm/types.ts'
import { executePrompt } from '@/network/prompt-execution.service.ts'

interface TimelinePromptNode {
  label: string
  nodeType: TimelineNodeType
  date: string
  datePrecision: DatePrecision
  description: string
}

interface TimelinePromptEdge {
  sourceLabel: string
  targetLabel: string
  relationshipType: RelationshipType
  strength: number
  evidence: string
}

interface TimelinePromptResponse {
  nodes: TimelinePromptNode[]
  edges: TimelinePromptEdge[]
}

export function buildTimelinePrompt(concept: Concept): { system: string; user: string } {
  const system = `You are an expert in conceptual evolution analysis. Given a concept, identify its historical timeline including:
- Origin points and early developments
- Variations and alternative approaches
- Merges with other concepts
- Current state and implementations
- Future projections

Return a JSON object with:
- nodes: array of timeline nodes with fields:
  * label: brief name/title
  * nodeType: one of "origin" | "milestone" | "branch" | "merge" | "current" | "projection"
  * date: ISO date string (YYYY-MM-DD format)
  * datePrecision: one of "exact" | "month" | "year" | "decade" | "century" | "estimated"
  * description: brief description of this point in evolution

- edges: array of connections with fields:
  * sourceLabel: label of source node
  * targetLabel: label of target node
  * relationshipType: one of "evolves_to" | "influences" | "branches_from" | "merges_with" | "implements" | "supersedes"
  * strength: number between 0-1 indicating connection strength
  * evidence: brief evidence or reasoning for this connection

Focus on factual, verifiable timeline points. For projections, clearly indicate they are future-looking.`

  const user = `Analyze the evolution timeline for this concept:

Name: ${concept.name}
Description: ${concept.description}
Domain: ${concept.domain || 'Not specified'}
${concept.themes?.length ? `Themes: ${concept.themes.join(', ')}` : ''}
${concept.sourceReferences?.length ? `References: ${concept.sourceReferences.map((r) => r.fileName).join(', ')}` : ''}

Generate a comprehensive timeline showing its evolution from origin to current state and future projections.`

  return { system, user }
}

export async function generateTimeline(
  concept: Concept,
  provider: LlmProvider,
): Promise<{ nodes: TimelineNode[]; edges: TimelineEdge[] }> {
  const { system, user } = buildTimelinePrompt(concept)

  try {
    const response = await executePrompt(provider, system, user, { jsonMode: true })

    // Strip markdown code fences if present
    let jsonText = response.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '')
    }

    const data = JSON.parse(jsonText) as TimelinePromptResponse

    // Map nodes with UUIDs and positions
    const nodes: TimelineNode[] = data.nodes.map((node) => ({
      id: crypto.randomUUID(),
      conceptId: concept.id,
      label: node.label,
      nodeType: node.nodeType,
      date: new Date(node.date),
      datePrecision: node.datePrecision,
      description: node.description,
      sourceRefs: [],
      position: { x: 0, y: 0 },
    }))

    // Create label to ID map for edge mapping
    const labelToId = new Map<string, string>()
    nodes.forEach((node) => labelToId.set(node.label, node.id))

    // Map edges with UUIDs
    const edges: TimelineEdge[] = data.edges
      .map((edge) => {
        const sourceId = labelToId.get(edge.sourceLabel)
        const targetId = labelToId.get(edge.targetLabel)

        if (!sourceId || !targetId) {
          console.warn(
            `Timeline edge references unknown node: ${edge.sourceLabel} -> ${edge.targetLabel}`,
          )
          return null
        }

        return {
          id: crypto.randomUUID(),
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          relationshipType: edge.relationshipType,
          strength: edge.strength,
          evidence: edge.evidence,
          sourceRefs: [],
        }
      })
      .filter((e) => e !== null) as TimelineEdge[]

    return { nodes, edges }
  } catch (error) {
    console.error('Failed to generate timeline:', error)
    throw new Error(
      `Timeline generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
