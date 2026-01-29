// ============================================================================
// IDEATOR — Storage Service Abstraction (BE-1.3)
// Service layer abstracting IndexedDB operations
// ============================================================================

import { db } from './database';
import type {
  FileRecord,
  Concept,
  ConceptCluster,
  AnalysisResult,
  TimelineNode,
  TimelineEdge,
  MapNode,
  GeneratedAsset,
  QueueJob,
  UserSettings,
  ConceptFilters,
  AnalysisFilters,
} from '../../shared/types';

export class StorageService {
  // --------------------------------------------------------------------------
  // Files
  // --------------------------------------------------------------------------

  async saveFile(file: FileRecord): Promise<string> {
    await db.files.put(file);
    return file.id;
  }

  async getFile(id: string): Promise<FileRecord | undefined> {
    return db.files.get(id);
  }

  async getAllFiles(): Promise<FileRecord[]> {
    return db.files.toArray();
  }

  async deleteFile(id: string): Promise<void> {
    await db.files.delete(id);
  }

  // --------------------------------------------------------------------------
  // Concepts
  // --------------------------------------------------------------------------

  async saveConcept(concept: Concept): Promise<string> {
    await db.concepts.put(concept);
    return concept.id;
  }

  async saveConcepts(concepts: Concept[]): Promise<void> {
    await db.concepts.bulkPut(concepts);
  }

  async getConcept(id: string): Promise<Concept | undefined> {
    return db.concepts.get(id);
  }

  async getConcepts(filters?: ConceptFilters): Promise<Concept[]> {
    if (!filters) return db.concepts.toArray();

    let results: Concept[];

    // Start with an indexed field if possible for efficiency
    if (filters.abstractionLevels && filters.abstractionLevels.length > 0) {
      results = await db.concepts
        .where('abstractionLevel')
        .anyOf(filters.abstractionLevels)
        .toArray();
    } else if (filters.domains && filters.domains.length > 0) {
      results = await db.concepts
        .where('domain')
        .anyOf(filters.domains)
        .toArray();
    } else {
      results = await db.concepts.toArray();
    }

    // Apply remaining filters in memory
    if (filters.abstractionLevels && filters.abstractionLevels.length > 0 && filters.domains) {
      // If we indexed on abstraction, still need to filter domain
      results = results.filter((c) => filters.domains!.includes(c.domain));
    }
    if (filters.domains && filters.domains.length > 0 && filters.abstractionLevels) {
      // If we indexed on domain, still need to filter abstraction
      results = results.filter((c) =>
        filters.abstractionLevels!.includes(c.abstractionLevel)
      );
    }
    if (filters.dateRange) {
      const from = filters.dateRange.from.getTime();
      const to = filters.dateRange.to.getTime();
      results = results.filter((c) => {
        const ts = new Date(c.extractionTimestamp).getTime();
        return ts >= from && ts <= to;
      });
    }
    if (filters.sourceFileIds && filters.sourceFileIds.length > 0) {
      const ids = new Set(filters.sourceFileIds);
      results = results.filter((c) =>
        c.sourceReferences.some((ref) => ids.has(ref.fileId))
      );
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.themes.some((t) => t.toLowerCase().includes(q))
      );
    }

    return results;
  }

  async deleteConcept(id: string): Promise<void> {
    await db.concepts.delete(id);
  }

  // --------------------------------------------------------------------------
  // Clusters
  // --------------------------------------------------------------------------

  async saveCluster(cluster: ConceptCluster): Promise<string> {
    await db.clusters.put(cluster);
    return cluster.id;
  }

  async getClusters(): Promise<ConceptCluster[]> {
    return db.clusters.toArray();
  }

  // --------------------------------------------------------------------------
  // Analyses
  // --------------------------------------------------------------------------

  async saveAnalysis(analysis: AnalysisResult): Promise<string> {
    await db.analyses.put(analysis);
    return analysis.id;
  }

  async getAnalysis(conceptId: string): Promise<AnalysisResult | undefined> {
    return db.analyses.where('conceptId').equals(conceptId).first();
  }

  async getAnalyses(filters?: AnalysisFilters): Promise<AnalysisResult[]> {
    if (!filters) return db.analyses.toArray();

    let results = await db.analyses.toArray();

    if (filters.validityTiers && filters.validityTiers.length > 0) {
      const tiers = new Set(filters.validityTiers);
      results = results.filter((a) => tiers.has(a.validityTier));
    }
    if (filters.scoreRange) {
      results = results.filter(
        (a) =>
          a.compositeScore >= filters.scoreRange!.min &&
          a.compositeScore <= filters.scoreRange!.max
      );
    }
    // Cross-filter: if concept-level filters provided, load concepts and filter
    if (
      filters.abstractionLevels ||
      filters.domains ||
      filters.dateRange ||
      filters.sourceFileIds ||
      filters.searchQuery
    ) {
      const matchingConcepts = await this.getConcepts(filters);
      const conceptIds = new Set(matchingConcepts.map((c) => c.id));
      results = results.filter((a) => conceptIds.has(a.conceptId));
    }

    return results;
  }

  // --------------------------------------------------------------------------
  // Visualization Data
  // --------------------------------------------------------------------------

  async saveTimelineNodes(nodes: TimelineNode[]): Promise<void> {
    await db.timelineNodes.bulkPut(nodes);
  }

  async getTimelineNodes(conceptId: string): Promise<TimelineNode[]> {
    return db.timelineNodes.where('conceptId').equals(conceptId).toArray();
  }

  async saveTimelineEdges(edges: TimelineEdge[]): Promise<void> {
    await db.timelineEdges.bulkPut(edges);
  }

  async getTimelineEdges(nodeIds: string[]): Promise<TimelineEdge[]> {
    return db.timelineEdges
      .where('sourceNodeId')
      .anyOf(nodeIds)
      .or('targetNodeId')
      .anyOf(nodeIds)
      .toArray();
  }

  async saveMapNodes(nodes: MapNode[]): Promise<void> {
    await db.mapNodes.bulkPut(nodes);
  }

  async getMapNodes(): Promise<MapNode[]> {
    return db.mapNodes.toArray();
  }

  // --------------------------------------------------------------------------
  // Assets
  // --------------------------------------------------------------------------

  async saveAsset(asset: GeneratedAsset): Promise<string> {
    await db.assets.put(asset);
    return asset.id;
  }

  async getAsset(id: string): Promise<GeneratedAsset | undefined> {
    return db.assets.get(id);
  }

  async getAssetsByConcept(conceptId: string): Promise<GeneratedAsset[]> {
    return db.assets.where('conceptId').equals(conceptId).toArray();
  }

  // --------------------------------------------------------------------------
  // Queue
  // --------------------------------------------------------------------------

  async saveQueueJob(job: QueueJob): Promise<string> {
    await db.queue.put(job);
    return job.id;
  }

  async getQueueJobs(): Promise<QueueJob[]> {
    return db.queue.orderBy('queuedAt').toArray();
  }

  async deleteQueueJob(id: string): Promise<void> {
    await db.queue.delete(id);
  }

  // --------------------------------------------------------------------------
  // Settings
  // --------------------------------------------------------------------------

  async saveSettings(settings: UserSettings): Promise<void> {
    await db.settings.put(settings);
  }

  async getSettings(): Promise<UserSettings | undefined> {
    return db.settings.toCollection().first();
  }

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------

  /** Estimate storage usage in bytes */
  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
    }
    return { usage: 0, quota: 0 };
  }

  /** Clear all data */
  async clearAll(): Promise<void> {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
      }
    });
  }
}

/** Singleton storage service */
export const storageService = new StorageService();
