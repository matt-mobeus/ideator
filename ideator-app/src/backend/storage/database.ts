// ============================================================================
// IDEATOR — IndexedDB Schema (BE-1.1)
// Dexie.js database definition with all 8 stores
// ============================================================================

import Dexie, { type Table } from 'dexie';
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
} from '../../shared/types';
import type { QueuedRequest } from '../../network/offline/RequestQueue';
import type { Claim } from '../../shared/types/models';

/** Provenance record stored separately for query efficiency */
export interface ProvenanceRecord {
  id: string;
  conceptId: string;
  assetId: string;
  claims: Claim[];
}

export class IdeatorDatabase extends Dexie {
  files!: Table<FileRecord, string>;
  concepts!: Table<Concept, string>;
  clusters!: Table<ConceptCluster, string>;
  analyses!: Table<AnalysisResult, string>;
  timelineNodes!: Table<TimelineNode, string>;
  timelineEdges!: Table<TimelineEdge, string>;
  mapNodes!: Table<MapNode, string>;
  assets!: Table<GeneratedAsset, string>;
  provenance!: Table<ProvenanceRecord, string>;
  queue!: Table<QueueJob, string>;
  offlineQueue!: Table<QueuedRequest, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('IdeatorDB');

    this.version(1).stores({
      files: 'id, name, mimeType, formatCategory, uploadedAt, processed',
      concepts: 'id, name, domain, abstractionLevel, clusterId, extractionTimestamp, *themes',
      clusters: 'id, name',
      analyses: 'id, conceptId, validityTier, compositeScore, analyzedTimestamp',
      timelineNodes: 'id, conceptId, nodeType, date',
      timelineEdges: 'id, sourceNodeId, targetNodeId, relationshipType',
      mapNodes: 'id, nodeType, label',
      assets: 'id, assetType, conceptId, generatedTimestamp',
      provenance: 'id, conceptId, assetId',
      queue: 'id, conceptId, status, queuedAt',
      offlineQueue: 'id, type, createdAt',
      settings: 'version',
    });
  }
}

/** Singleton database instance */
export const db = new IdeatorDatabase();
