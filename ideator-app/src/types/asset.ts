export type DocumentAssetType =
  | 'executive_summary' | 'pitch_deck' | 'one_pager'
  | 'technical_brief' | 'market_report' | 'whitepaper'

export type VisualAssetType =
  | 'infographic' | 'concept_diagram' | 'timeline_graphic'
  | 'comparison_chart' | 'data_visualization'

export type AssetType = DocumentAssetType | VisualAssetType

export type AssetFormat = 'pdf' | 'pptx' | 'png' | 'svg'

export interface Claim {
  statement: string
  sourceRefs: { fileId: string; fileName: string; location: string; excerpt: string }[]
  confidence: number
  synthesisNotes: string
}

export interface ProvenanceChain {
  claims: Claim[]
}

export interface GeneratedAsset {
  id: string
  assetType: AssetType
  format: AssetFormat
  conceptId: string
  fileName: string
  blob?: Blob
  provenance: ProvenanceChain
  generatedAt: Date
}
