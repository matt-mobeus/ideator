// ============================================================================
// IDEATOR — Shared Enums
// ============================================================================

/** Concept abstraction level (L1/L2/L3) */
export enum AbstractionLevel {
  L1_SPECIFIC = 'L1_SPECIFIC',
  L2_APPROACH = 'L2_APPROACH',
  L3_PARADIGM = 'L3_PARADIGM',
}

/** Validity tier for analysis results */
export enum ValidityTier {
  T1_HIGH = 'T1_HIGH',         // 75-100
  T2_MODERATE = 'T2_MODERATE', // 50-74
  T3_LOW = 'T3_LOW',           // 25-49
  T4_NOT_VIABLE = 'T4_NOT_VIABLE', // 0-24
}

/** Timeline node types for branching tree visualization */
export enum TimelineNodeType {
  ORIGIN = 'ORIGIN',
  VARIATION = 'VARIATION',
  MERGE = 'MERGE',
  CURRENT = 'CURRENT',
  PROJECTED = 'PROJECTED',
}

/** Edge relationship types for node map */
export enum EdgeRelationshipType {
  DERIVED = 'DERIVED',
  MERGED = 'MERGED',
  INFLUENCED = 'INFLUENCED',
  CITED = 'CITED',
  FUNDED = 'FUNDED',
  CREATED = 'CREATED',
  REFERENCED = 'REFERENCED',
  EMPLOYED = 'EMPLOYED',
  COMPETED = 'COMPETED',
}

/** Node types for interactive node map */
export enum MapNodeType {
  CONCEPT = 'CONCEPT',
  PATENT = 'PATENT',
  PUBLICATION = 'PUBLICATION',
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
  EVENT = 'EVENT',
}

/** Generated asset types */
export enum AssetType {
  // Documents
  EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY',
  PITCH_DECK = 'PITCH_DECK',
  ONE_PAGER = 'ONE_PAGER',
  TECHNICAL_BRIEF = 'TECHNICAL_BRIEF',
  MARKET_REPORT = 'MARKET_REPORT',
  WHITEPAPER = 'WHITEPAPER',
  // Visuals
  INFOGRAPHIC = 'INFOGRAPHIC',
  CONCEPT_DIAGRAM = 'CONCEPT_DIAGRAM',
  TIMELINE_GRAPHIC = 'TIMELINE_GRAPHIC',
  COMPARISON_CHART = 'COMPARISON_CHART',
  DATA_VISUALIZATION = 'DATA_VISUALIZATION',
}

/** File format categories */
export enum FileFormatCategory {
  TEXT = 'TEXT',
  MULTIMEDIA = 'MULTIMEDIA',
  STRUCTURED = 'STRUCTURED',
}

/** Job states for the analysis queue */
export enum JobStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/** Analysis processing phases */
export enum AnalysisPhase {
  SEARCHING_TRENDS = 'SEARCHING_TRENDS',
  ANALYZING_FEASIBILITY = 'ANALYZING_FEASIBILITY',
  EVALUATING_INVESTMENT = 'EVALUATING_INVESTMENT',
  GENERATING_VISUALIZATIONS = 'GENERATING_VISUALIZATIONS',
  COMPILING_REPORT = 'COMPILING_REPORT',
}

/** Date precision for timeline nodes */
export enum DatePrecision {
  EXACT = 'EXACT',
  YEAR = 'YEAR',
  DECADE = 'DECADE',
  ESTIMATED = 'ESTIMATED',
}

/** LLM provider identifiers */
export enum LLMProvider {
  ANTHROPIC = 'ANTHROPIC',
  GEMINI = 'GEMINI',
}

/** Supported file extensions */
export const SUPPORTED_EXTENSIONS = {
  text: ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.epub', '.md', '.html', '.htm', '.tex'],
  multimedia: ['.mp4', '.mov', '.webm', '.avi', '.mp3', '.wav', '.m4a', '.ogg', '.pptx', '.ppt', '.key', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.tiff'],
  structured: ['.xlsx', '.xls', '.csv', '.json'],
} as const;
