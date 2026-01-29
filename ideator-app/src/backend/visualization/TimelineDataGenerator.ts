// ============================================================================
// IDEATOR — Timeline Data Generator (BE-5.1)
// Generates branching tree data for concept evolution visualization
// ============================================================================

import type { Concept, TimelineNode, TimelineEdge } from '../../shared/types';
import { TimelineNodeType, EdgeRelationshipType, DatePrecision } from '../../shared/types';
import { PromptService } from '../../network/search/PromptService';
import { generateId } from '../../shared/utils';

export interface TimelineData {
  nodes: TimelineNode[];
  edges: TimelineEdge[];
}

interface TimelineEvent {
  label: string;
  date: string;
  datePrecision: string;
  nodeType: string;
  description: string;
  connectedTo?: string[];
  connectionType?: string;
}

export class TimelineDataGenerator {
  private promptService: PromptService;

  constructor(promptService: PromptService) {
    this.promptService = promptService;
  }

  async generate(concept: Concept): Promise<TimelineData> {
    const response = await this.promptService.executeWithRetry({
      system: `You are a technology historian. Generate a timeline of evolution events for the given concept, from its origins to projected future developments.

Node types: ORIGIN, VARIATION, MERGE, CURRENT, PROJECTED
Date precisions: EXACT, YEAR, DECADE, ESTIMATED
Connection types: DERIVED, MERGED, INFLUENCED`,
      user: `Generate a timeline for:
CONCEPT: ${concept.name}
DESCRIPTION: ${concept.description}
DOMAIN: ${concept.domain}

Return JSON:
{"events":[{"label":"event name","date":"2020-01-01","datePrecision":"YEAR","nodeType":"ORIGIN","description":"what happened","connectedTo":["other event label"],"connectionType":"DERIVED"}]}

Include 5-10 events spanning origins to future projections.`,
      jsonMode: true,
      maxTokens: 4096,
      temperature: 0.4,
    });

    const parsed = PromptService.extractJSON<{ events: TimelineEvent[] }>(response);
    const events = parsed.events ?? [];

    const NODE_TYPE_MAP: Record<string, TimelineNodeType> = {
      ORIGIN: TimelineNodeType.ORIGIN,
      VARIATION: TimelineNodeType.VARIATION,
      MERGE: TimelineNodeType.MERGE,
      CURRENT: TimelineNodeType.CURRENT,
      PROJECTED: TimelineNodeType.PROJECTED,
    };

    const PRECISION_MAP: Record<string, DatePrecision> = {
      EXACT: DatePrecision.EXACT,
      YEAR: DatePrecision.YEAR,
      DECADE: DatePrecision.DECADE,
      ESTIMATED: DatePrecision.ESTIMATED,
    };

    const EDGE_TYPE_MAP: Record<string, EdgeRelationshipType> = {
      DERIVED: EdgeRelationshipType.DERIVED,
      MERGED: EdgeRelationshipType.MERGED,
      INFLUENCED: EdgeRelationshipType.INFLUENCED,
    };

    // Create nodes
    const labelToId = new Map<string, string>();
    const nodes: TimelineNode[] = events.map((e, i) => {
      const id = generateId();
      labelToId.set(e.label.toLowerCase(), id);
      return {
        id,
        conceptId: concept.id,
        nodeType: NODE_TYPE_MAP[e.nodeType] ?? TimelineNodeType.CURRENT,
        label: e.label,
        date: new Date(e.date || Date.now()),
        datePrecision: PRECISION_MAP[e.datePrecision] ?? DatePrecision.ESTIMATED,
        description: e.description ?? '',
        sourceRefs: [],
        position: { x: 100 + i * 150, y: 200 + (i % 3) * 80 },
      };
    });

    // Create edges
    const edges: TimelineEdge[] = [];
    for (const e of events) {
      const sourceId = labelToId.get(e.label.toLowerCase());
      if (!sourceId || !e.connectedTo) continue;

      for (const targetLabel of e.connectedTo) {
        const targetId = labelToId.get(targetLabel.toLowerCase());
        if (targetId) {
          edges.push({
            id: generateId(),
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            relationshipType: EDGE_TYPE_MAP[e.connectionType ?? ''] ?? EdgeRelationshipType.DERIVED,
            strength: 0.8,
            evidence: '',
            sourceRefs: [],
          });
        }
      }
    }

    return { nodes, edges };
  }
}
