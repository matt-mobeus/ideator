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
    // TODO: Apply filters (abstraction level, domain, date range, search)
    if (!filters) return db.concepts.toArray();
    throw new Error('StorageService.getConcepts with filters not yet implemented');
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
    // TODO: Apply analysis-specific filters
    throw new Error('StorageService.getAnalyses with filters not yet implemented');
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
