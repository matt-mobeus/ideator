export type AbstractionLevel = 'L1_SPECIFIC' | 'L2_APPROACH' | 'L3_PARADIGM'

export interface SourceRef {
  fileId: string
  fileName: string
  location: string
  excerpt: string
  context: string
}

export interface Concept {
  id: string
  name: string
  description: string
  abstractionLevel: AbstractionLevel
  domain: string
  themes: string[]
  parentConcepts: string[]
  childConcepts: string[]
  relatedConcepts: string[]
  sourceReferences: SourceRef[]
  clusterId: string
  extractionTimestamp: Date
}

export interface Cluster {
  id: string
  name: string
  domain: string
  conceptIds: string[]
}
