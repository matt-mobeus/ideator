import Dexie, { type EntityTable } from 'dexie'
import type { SourceFile } from '@/types/file.ts'
import type { Concept, Cluster } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'
import type { VisualizationData } from '@/types/visualization.ts'
import type { GeneratedAsset } from '@/types/asset.ts'
import type { Job } from '@/types/queue.ts'
import type { AppSettings } from '@/types/settings.ts'

export interface ProvenanceRecord {
  id: string
  conceptId: string
  assetId: string
  claims: { statement: string; fileId: string; excerpt: string; confidence: number }[]
  createdAt: Date
}

export class IdeatorDatabase extends Dexie {
  files!: EntityTable<SourceFile, 'id'>
  concepts!: EntityTable<Concept, 'id'>
  clusters!: EntityTable<Cluster, 'id'>
  analyses!: EntityTable<AnalysisResult, 'id'>
  visualizations!: EntityTable<VisualizationData, 'id'>
  assets!: EntityTable<GeneratedAsset, 'id'>
  provenance!: EntityTable<ProvenanceRecord, 'id'>
  queue!: EntityTable<Job, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('ideator')

    this.version(1).stores({
      files: 'id, name, format, category, processingStatus, uploadedAt',
      concepts: 'id, name, domain, abstractionLevel, clusterId, extractionTimestamp',
      clusters: 'id, name, domain',
      analyses: 'id, conceptId, tier, compositeScore, analyzedAt',
      visualizations: 'id, conceptId, generatedAt',
      assets: 'id, conceptId, assetType, format, generatedAt',
      provenance: 'id, conceptId, assetId, createdAt',
      queue: 'id, type, status, targetId, createdAt',
      settings: 'id',
    })
  }
}

export const db = new IdeatorDatabase()
