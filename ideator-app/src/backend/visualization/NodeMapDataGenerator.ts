// ============================================================================
// IDEATOR — Node Map Data Generator (BE-5.2)
// Generates interactive node map data
// ============================================================================

import type { Concept, MapNode, TimelineEdge } from '../../shared/types';
import { MapNodeType, EdgeRelationshipType } from '../../shared/types';
import { PromptService } from '../../network/search/PromptService';
import { generateId } from '../../shared/utils';

export interface NodeMapData {
  nodes: MapNode[];
  edges: TimelineEdge[];
}

interface MapEntity {
  label: string;
  nodeType: string;
  description: string;
  importance: number;
  relatedTo?: Array<{ label: string; relationship: string }>;
}

export class NodeMapDataGenerator {
  private promptService: PromptService;

  constructor(promptService: PromptService) {
    this.promptService = promptService;
  }

  async generate(concept: Concept): Promise<NodeMapData> {
    const response = await this.promptService.executeWithRetry({
      system: `You are a knowledge graph builder. Generate a network of related entities for a concept.

Node types: CONCEPT, PATENT, PUBLICATION, PERSON, COMPANY, EVENT
Relationships: DERIVED, CITED, FUNDED, CREATED, REFERENCED, EMPLOYED, COMPETED`,
      user: `Build a knowledge map for:
CONCEPT: ${concept.name}
DESCRIPTION: ${concept.description}
DOMAIN: ${concept.domain}

Return JSON:
{"entities":[{"label":"entity name","nodeType":"CONCEPT","description":"brief desc","importance":0.9,"relatedTo":[{"label":"other entity","relationship":"CREATED"}]}]}

Include 8-15 entities of mixed types.`,
      jsonMode: true,
      maxTokens: 4096,
      temperature: 0.4,
    });

    const parsed = PromptService.extractJSON<{ entities: MapEntity[] }>(response);
    const entities = parsed.entities ?? [];

    const NODE_TYPE_MAP: Record<string, MapNodeType> = {
      CONCEPT: MapNodeType.CONCEPT,
      PATENT: MapNodeType.PATENT,
      PUBLICATION: MapNodeType.PUBLICATION,
      PERSON: MapNodeType.PERSON,
      COMPANY: MapNodeType.COMPANY,
      EVENT: MapNodeType.EVENT,
    };

    const EDGE_TYPE_MAP: Record<string, EdgeRelationshipType> = {
      DERIVED: EdgeRelationshipType.DERIVED,
      CITED: EdgeRelationshipType.CITED,
      FUNDED: EdgeRelationshipType.FUNDED,
      CREATED: EdgeRelationshipType.CREATED,
      REFERENCED: EdgeRelationshipType.REFERENCED,
      EMPLOYED: EdgeRelationshipType.EMPLOYED,
      COMPETED: EdgeRelationshipType.COMPETED,
    };

    // Create nodes with circular layout
    const labelToId = new Map<string, string>();
    const nodes: MapNode[] = entities.map((e, i) => {
      const id = generateId();
      labelToId.set(e.label.toLowerCase(), id);
      const angle = (2 * Math.PI * i) / entities.length;
      const radius = 300;
      return {
        id,
        nodeType: NODE_TYPE_MAP[e.nodeType] ?? MapNodeType.CONCEPT,
        label: e.label,
        description: e.description ?? '',
        importance: Math.max(0, Math.min(1, e.importance ?? 0.5)),
        position: {
          x: 400 + radius * Math.cos(angle),
          y: 400 + radius * Math.sin(angle),
        },
        metadata: { conceptId: concept.id },
      };
    });

    // Create edges
    const edges: TimelineEdge[] = [];
    for (const e of entities) {
      const sourceId = labelToId.get(e.label.toLowerCase());
      if (!sourceId || !e.relatedTo) continue;

      for (const rel of e.relatedTo) {
        const targetId = labelToId.get(rel.label.toLowerCase());
        if (targetId) {
          edges.push({
            id: generateId(),
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            relationshipType: EDGE_TYPE_MAP[rel.relationship] ?? EdgeRelationshipType.REFERENCED,
            strength: 0.7,
            evidence: '',
            sourceRefs: [],
          });
        }
      }
    }

    return { nodes, edges };
  }
}
