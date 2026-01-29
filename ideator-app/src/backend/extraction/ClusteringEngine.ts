// ============================================================================
// IDEATOR — Clustering Engine (BE-3.3)
// Groups extracted concepts by theme/domain
// ============================================================================

import type { Concept, ConceptCluster } from '../../shared/types';
import { PromptService } from '../../network/search/PromptService';
import { ExtractionPromptBuilder } from './ExtractionPromptBuilder';
import { generateId } from '../../shared/utils';

interface ClusterResult {
  clusters: Array<{
    name: string;
    summary: string;
    conceptNames: string[];
  }>;
}

export class ClusteringEngine {
  private promptService: PromptService;
  private promptBuilder: ExtractionPromptBuilder;

  constructor(promptService: PromptService) {
    this.promptService = promptService;
    this.promptBuilder = new ExtractionPromptBuilder();
  }

  async cluster(
    concepts: Concept[]
  ): Promise<{ concepts: Concept[]; clusters: ConceptCluster[] }> {
    if (concepts.length === 0) return { concepts: [], clusters: [] };

    const simplified = concepts.map((c) => ({
      name: c.name,
      description: c.description,
      domain: c.domain,
      themes: c.themes,
      abstractionLevel: c.abstractionLevel,
    }));

    const response = await this.promptService.executeWithRetry(
      this.promptBuilder.buildPass3Prompt(simplified)
    );

    let result: ClusterResult;
    try {
      result = PromptService.extractJSON<ClusterResult>(response);
    } catch {
      result = {
        clusters: [{
          name: 'All Concepts',
          summary: 'All extracted concepts.',
          conceptNames: concepts.map((c) => c.name),
        }],
      };
    }

    const nameMap = new Map<string, Concept>();
    for (const c of concepts) nameMap.set(c.name.toLowerCase(), c);

    const clusters: ConceptCluster[] = [];
    const assigned = new Set<string>();

    for (const cd of result.clusters) {
      const clusterId = generateId();
      const conceptIds: string[] = [];

      for (const name of cd.conceptNames) {
        const concept = nameMap.get(name.toLowerCase());
        if (concept && !assigned.has(concept.id)) {
          concept.clusterId = clusterId;
          conceptIds.push(concept.id);
          assigned.add(concept.id);
        }
      }

      if (conceptIds.length > 0) {
        clusters.push({
          id: clusterId,
          name: cd.name,
          summary: cd.summary,
          conceptCount: conceptIds.length,
          conceptIds,
        });
      }
    }

    const unassigned = concepts.filter((c) => !assigned.has(c.id));
    if (unassigned.length > 0) {
      const otherId = generateId();
      for (const c of unassigned) c.clusterId = otherId;
      clusters.push({
        id: otherId,
        name: 'Other',
        summary: 'Concepts not assigned to a specific cluster.',
        conceptCount: unassigned.length,
        conceptIds: unassigned.map((c) => c.id),
      });
    }

    return { concepts, clusters };
  }
}
