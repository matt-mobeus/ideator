// ============================================================================
// IDEATOR — Core Data Models (BE-1.2)
// All TypeScript interfaces matching specification data models
// ============================================================================

import {
  AbstractionLevel,
  ValidityTier,
  TimelineNodeType,
  EdgeRelationshipType,
  MapNodeType,
  AssetType,
  FileFormatCategory,
  JobStatus,
  AnalysisPhase,
  DatePrecision,
} from './enums';

// ----------------------------------------------------------------------------
// Source Reference
// ----------------------------------------------------------------------------

/** Reference to a specific location within a source file */
export interface SourceRef {
  /** UUID of the source file */
  fileId: string;
  /** Display name of the source file */
  fileName: string;
  /** Location descriptor (page number, timestamp, slide number) */
  location: string;
  /** Verbatim excerpt from source (max 500 chars) */
  excerpt: string;
  /** Summary of surrounding context */
  context: string;
}

// ----------------------------------------------------------------------------
// File Record
// ----------------------------------------------------------------------------

/** Uploaded file metadata and storage record */
export interface FileRecord {
  /** UUID */
  id: string;
  /** Original filename */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** Detected format category */
  formatCategory: FileFormatCategory;
  /** File extension */
  extension: string;
  /** Binary blob (stored in IndexedDB) */
  blob: Blob;
  /** Upload timestamp */
  uploadedAt: Date;
  /** Whether file has been processed */
  processed: boolean;
  /** Extracted text corpus (populated after processing) */
  textCorpus?: string;
}

// ----------------------------------------------------------------------------
// Concept
// ----------------------------------------------------------------------------

/** An extracted concept from source material */
export interface Concept {
  /** UUID */
  id: string;
  /** Concise concept name */
  name: string;
  /** 2-3 sentence description */
  description: string;
  /** Abstraction level (L1/L2/L3) */
  abstractionLevel: AbstractionLevel;
  /** Domain classification (e.g., "Biotechnology", "Energy") */
  domain: string;
  /** Theme tags (e.g., ["sustainability", "automation"]) */
  themes: string[];
  /** UUIDs of higher-abstraction parent concepts */
  parentConcepts: string[];
  /** UUIDs of lower-abstraction child concepts */
  childConcepts: string[];
  /** UUIDs of same-level related concepts */
  relatedConcepts: string[];
  /** References to source material */
  sourceReferences: SourceRef[];
  /** When the concept was extracted */
  extractionTimestamp: Date;
  /** UUID of assigned cluster */
  clusterId: string;
}

/** A grouping of related concepts */
export interface ConceptCluster {
  /** UUID */
  id: string;
  /** Cluster display name (domain or theme) */
  name: string;
  /** Summary description of the cluster */
  summary: string;
  /** Number of concepts in this cluster */
  conceptCount: number;
  /** UUIDs of concepts in this cluster */
  conceptIds: string[];
}

// ----------------------------------------------------------------------------
// Analysis Result
// ----------------------------------------------------------------------------

/** Score breakdown for a single analysis dimension */
export interface DimensionScore {
  /** Overall score for this dimension (0-100) */
  score: number;
  /** Individual factor scores */
  factors: Record<string, number>;
  /** Qualitative analysis paragraph */
  analysis: string;
}

/** Full market analysis result for a concept */
export interface AnalysisResult {
  /** UUID */
  id: string;
  /** UUID of the analyzed concept */
  conceptId: string;
  /** Assigned validity tier */
  validityTier: ValidityTier;
  /** Composite score (0-100) */
  compositeScore: number;
  /** Market viability dimension */
  marketViability: DimensionScore;
  /** Technical feasibility dimension */
  technicalFeasibility: DimensionScore;
  /** Investment potential dimension */
  investmentPotential: DimensionScore;
  /** Full qualitative report */
  qualitativeReport: QualitativeReport;
  /** Evidence citations from web search */
  evidenceCitations: EvidenceCitation[];
  /** When the analysis was completed */
  analyzedTimestamp: Date;
}

/** Full qualitative report structure */
export interface QualitativeReport {
  /** 3-5 sentence executive summary */
  executiveSummary: string;
  /** Key risks and uncertainties */
  keyRisks: string[];
  /** Recommended next steps */
  recommendedNextSteps: string[];
}

/** A citation from web search evidence */
export interface EvidenceCitation {
  /** The claim being supported */
  statement: string;
  /** URL of the source */
  sourceUrl: string;
  /** Title of the source */
  sourceTitle: string;
  /** Relevant snippet from the source */
  snippet: string;
  /** When the source was published */
  publishedDate?: Date;
}

// ----------------------------------------------------------------------------
// Timeline / Visualization
// ----------------------------------------------------------------------------

/** A node in the branching tree visualization */
export interface TimelineNode {
  /** UUID */
  id: string;
  /** UUID of the parent concept */
  conceptId: string;
  /** Node type (origin, variation, merge, etc.) */
  nodeType: TimelineNodeType;
  /** Display label */
  label: string;
  /** Date of this node (exact or approximate) */
  date: Date;
  /** Precision of the date */
  datePrecision: DatePrecision;
  /** Description of what this node represents */
  description: string;
  /** Source references for this node */
  sourceRefs: SourceRef[];
  /** Position for node map layout */
  position: { x: number; y: number };
}

/** An edge in the timeline/node map */
export interface TimelineEdge {
  /** UUID */
  id: string;
  /** UUID of source node */
  sourceNodeId: string;
  /** UUID of target node */
  targetNodeId: string;
  /** Type of relationship */
  relationshipType: EdgeRelationshipType;
  /** Strength of relationship (0-1) */
  strength: number;
  /** Evidence description */
  evidence: string;
  /** Source references */
  sourceRefs: SourceRef[];
}

/** A node in the interactive node map */
export interface MapNode {
  /** UUID */
  id: string;
  /** Type of node (concept, patent, person, etc.) */
  nodeType: MapNodeType;
  /** Display label */
  label: string;
  /** Description */
  description: string;
  /** Importance score for sizing (0-1) */
  importance: number;
  /** Position in layout */
  position: { x: number; y: number };
  /** Associated data (concept ID, URL, etc.) */
  metadata: Record<string, string>;
}

// ----------------------------------------------------------------------------
// Asset Generation
// ----------------------------------------------------------------------------

/** A generated asset (document or visual) */
export interface GeneratedAsset {
  /** UUID */
  id: string;
  /** Type of asset */
  assetType: AssetType;
  /** UUID of the source concept */
  conceptId: string;
  /** Storage path / key */
  filePath: string;
  /** Binary blob of the generated file */
  blob: Blob;
  /** MIME type of the output */
  mimeType: string;
  /** When the asset was generated */
  generatedTimestamp: Date;
  /** Full provenance chain */
  provenance: ProvenanceChain;
}

/** Provenance chain linking asset claims to sources */
export interface ProvenanceChain {
  /** All claims made in the generated asset */
  claims: Claim[];
}

/** A single claim with source traceability */
export interface Claim {
  /** The assertion made in the asset */
  statement: string;
  /** Source references supporting this claim */
  sourceRefs: SourceRef[];
  /** Confidence in this claim (0-1) */
  confidence: number;
  /** How sources were combined/interpreted */
  synthesisNotes: string;
}

// ----------------------------------------------------------------------------
// Queue
// ----------------------------------------------------------------------------

/** A queued analysis job */
export interface QueueJob {
  /** UUID */
  id: string;
  /** UUID of the concept to analyze */
  conceptId: string;
  /** Display name for the job */
  conceptName: string;
  /** Current status */
  status: JobStatus;
  /** Current processing phase (if processing) */
  currentPhase?: AnalysisPhase;
  /** Progress percentage (0-100) */
  progress: number;
  /** When the job was queued */
  queuedAt: Date;
  /** When processing started */
  startedAt?: Date;
  /** When the job completed or failed */
  completedAt?: Date;
  /** Error message if failed */
  errorMessage?: string;
}

// ----------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------

/** User settings / preferences */
export interface UserSettings {
  /** Anthropic API key */
  anthropicApiKey?: string;
  /** Google Gemini API key */
  geminiApiKey?: string;
  /** Google OAuth client ID (for Drive) */
  googleClientId?: string;
  /** Preferred LLM provider */
  preferredProvider: 'ANTHROPIC' | 'GEMINI';
  /** App version */
  version: string;
}

// ----------------------------------------------------------------------------
// Filters
// ----------------------------------------------------------------------------

/** Filter criteria for concept queries */
export interface ConceptFilters {
  /** Filter by abstraction levels */
  abstractionLevels?: AbstractionLevel[];
  /** Filter by domains */
  domains?: string[];
  /** Filter by date range */
  dateRange?: { from: Date; to: Date };
  /** Filter by source file IDs */
  sourceFileIds?: string[];
  /** Text search query */
  searchQuery?: string;
}

/** Filter criteria for analysis result queries */
export interface AnalysisFilters extends ConceptFilters {
  /** Filter by validity tiers */
  validityTiers?: ValidityTier[];
  /** Filter by score range */
  scoreRange?: { min: number; max: number };
}
