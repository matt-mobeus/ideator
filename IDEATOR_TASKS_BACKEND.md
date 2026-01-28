# IDEATOR — Backend Team Task List

**Sprint Planning Document**  
**Reference:** IDEATOR_SPECIFICATION.md

---

## Overview

The backend team is responsible for all data processing, transformation, storage, and business logic. This includes file processing pipelines, LLM orchestration, concept extraction, market analysis, visualization data generation, and asset generation.

**Primary Technologies:** TypeScript/JavaScript, IndexedDB (Dexie.js), Web Workers

---

## Task Categories

1. [Data Storage Layer](#1-data-storage-layer)
2. [File Processing Pipeline](#2-file-processing-pipeline)
3. [Concept Extraction Engine](#3-concept-extraction-engine)
4. [Market Analysis Engine](#4-market-analysis-engine)
5. [Visualization Data Engine](#5-visualization-data-engine)
6. [Asset Generation Engine](#6-asset-generation-engine)
7. [Queue Management System](#7-queue-management-system)
8. [Search & Filter Engine](#8-search--filter-engine)

---

## 1. Data Storage Layer

### BE-1.1: IndexedDB Schema Design
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** None  
**Blocks:** All other backend tasks

**Description:**  
Design and implement the IndexedDB schema using Dexie.js wrapper.

**Deliverables:**
- [ ] Define schema for all 8 stores:
  - `files` — uploaded file metadata + blobs
  - `concepts` — extracted concept records
  - `analyses` — market analysis results
  - `visualizations` — timeline/node map data
  - `assets` — generated documents/images
  - `provenance` — source-to-claim mappings
  - `queue` — pending jobs
  - `settings` — user preferences
- [ ] Implement Dexie.js database class with typed interfaces
- [ ] Create migration strategy for schema versions
- [ ] Implement CRUD operations for each store
- [ ] Add indexing for searchable fields (concept name, domain, themes, dates)

**Acceptance Criteria:**
- All stores created with proper typing
- Basic CRUD operations functional
- Queries return in <100ms for 2000+ records

---

### BE-1.2: Data Models & TypeScript Interfaces
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** None  
**Blocks:** BE-2.x, BE-3.x, BE-4.x, BE-5.x, BE-6.x

**Description:**  
Define all TypeScript interfaces matching the specification data models.

**Deliverables:**
- [ ] `Concept` interface (id, name, description, abstraction_level, domain, themes, parent_concepts, child_concepts, related_concepts, source_references, extraction_timestamp, cluster_id)
- [ ] `SourceRef` interface (file_id, file_name, location, excerpt, context)
- [ ] `AnalysisResult` interface (concept_id, validity_tier, composite_score, market_viability, technical_feasibility, investment_potential, qualitative_report, evidence_citations, analyzed_timestamp)
- [ ] `TimelineNode` interface
- [ ] `TimelineEdge` interface
- [ ] `GeneratedAsset` interface
- [ ] `ProvenanceChain` and `Claim` interfaces
- [ ] `QueueJob` interface
- [ ] Enums: AbstractionLevel, ValidityTier, NodeType, EdgeType, AssetType

**Acceptance Criteria:**
- All interfaces match specification exactly
- Exported from shared types module
- JSDoc comments on all fields

---

### BE-1.3: Storage Service Abstraction
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** BE-1.1, BE-1.2  
**Blocks:** All feature implementations

**Description:**  
Create service layer abstracting IndexedDB operations.

**Deliverables:**
- [ ] `StorageService` class with methods:
  - `saveFile(file: FileRecord): Promise<string>`
  - `getFile(id: string): Promise<FileRecord>`
  - `saveConcept(concept: Concept): Promise<string>`
  - `getConcepts(filters?: ConceptFilters): Promise<Concept[]>`
  - `saveAnalysis(analysis: AnalysisResult): Promise<string>`
  - `getAnalysis(conceptId: string): Promise<AnalysisResult>`
  - Similar for all other stores
- [ ] Batch operations for bulk inserts
- [ ] Transaction support for atomic operations
- [ ] Storage quota monitoring utility

**Acceptance Criteria:**
- All CRUD operations abstracted
- Error handling with typed errors
- Unit tests with 90%+ coverage

---

## 2. File Processing Pipeline

### BE-2.1: File Format Detection
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** BE-1.2  
**Blocks:** BE-2.2, BE-2.3, BE-2.4, BE-2.5

**Description:**  
Implement file type detection from uploaded files.

**Deliverables:**
- [ ] Magic byte detection for binary formats
- [ ] Extension-based fallback detection
- [ ] MIME type validation
- [ ] Format categorization (TEXT, MULTIMEDIA, STRUCTURED)
- [ ] Supported format whitelist enforcement

**Acceptance Criteria:**
- Correctly identifies all 20+ supported formats
- Returns structured format metadata
- Handles corrupted/misnamed files gracefully

---

### BE-2.2: Text Document Processor
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 5 days  
**Dependencies:** BE-2.1, NET-1.1 (for OCR API if needed)  
**Blocks:** BE-3.1

**Description:**  
Extract text content from all supported document formats.

**Deliverables:**
- [ ] PDF text extraction (native + OCR fallback)
- [ ] DOCX/DOC parsing
- [ ] TXT/RTF/MD/HTML processing
- [ ] EPUB extraction
- [ ] LaTeX parsing
- [ ] Patent document specialized parser
- [ ] Page/section location tracking
- [ ] Output: unified text corpus with location metadata

**Acceptance Criteria:**
- Extracts text from all specified formats
- Preserves document structure (headings, sections)
- Location tracking accurate to page/paragraph
- Handles 100MB+ files without memory issues

---

### BE-2.3: Multimedia Processor
**Priority:** P1 (High)  
**Estimated Effort:** 5 days  
**Dependencies:** BE-2.1, NET-1.2 (transcription API), NET-1.3 (vision API)  
**Blocks:** BE-3.1

**Description:**  
Process video, audio, and presentation files.

**Deliverables:**
- [ ] Video processing pipeline:
  - Audio track extraction
  - Frame sampling (configurable interval, default 1/second)
  - On-screen text detection via OCR
- [ ] Audio transcription integration
- [ ] Presentation extraction (PPTX, KEY):
  - Slide content
  - Speaker notes
  - Embedded media
- [ ] Image OCR for diagrams/screenshots
- [ ] Timestamp/slide number tracking

**Acceptance Criteria:**
- Transcription accuracy comparable to API provider
- Frame analysis captures text/diagrams
- Processing time <2x media duration
- Memory efficient streaming for large files

---

### BE-2.4: Structured Data Processor
**Priority:** P2 (Medium)  
**Estimated Effort:** 2 days  
**Dependencies:** BE-2.1  
**Blocks:** BE-3.1

**Description:**  
Parse spreadsheets and JSON files.

**Deliverables:**
- [ ] XLSX/XLS/CSV parsing with header detection
- [ ] JSON schema inference and flattening
- [ ] Data-to-text conversion for concept extraction
- [ ] Cell/row location tracking

**Acceptance Criteria:**
- Handles malformed CSVs gracefully
- Nested JSON flattened correctly
- Large spreadsheets (100k+ rows) processed efficiently

---

### BE-2.5: Processing Orchestrator
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** BE-2.2, BE-2.3, BE-2.4  
**Blocks:** BE-3.1

**Description:**  
Coordinate file processing pipeline and output unified corpus.

**Deliverables:**
- [ ] Web Worker setup for background processing
- [ ] Pipeline coordinator routing files to correct processor
- [ ] Progress event emission for UI updates
- [ ] Unified text corpus builder
- [ ] Error aggregation and partial success handling

**Acceptance Criteria:**
- Non-blocking main thread
- Progress updates at <1s intervals
- Handles mixed file batches
- Graceful degradation on individual file failures

---

## 3. Concept Extraction Engine

### BE-3.1: Extraction Prompt Builder
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** BE-1.2, BE-2.5  
**Blocks:** BE-3.2

**Description:**  
Build LLM prompts for concept extraction.

**Deliverables:**
- [ ] System prompt template for concept extraction
- [ ] Chunking strategy for long documents (with overlap)
- [ ] Context window management
- [ ] Output schema definition (JSON format)
- [ ] Prompt versioning system

**Acceptance Criteria:**
- Prompts produce consistent structured output
- Handles documents exceeding context window
- Chunk overlap preserves concept continuity

---

### BE-3.2: Extraction Processor
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 4 days  
**Dependencies:** BE-3.1, NET-1.1  
**Blocks:** BE-3.3, Frontend Screen 2

**Description:**  
Execute concept extraction via LLM API.

**Deliverables:**
- [ ] Multi-pass extraction:
  - Pass 1: Entity recognition (technologies, methods, principles)
  - Pass 2: Abstraction level assignment (L1/L2/L3)
  - Pass 3: Relationship mapping (parent/child/related)
- [ ] Response parsing and validation
- [ ] Deduplication logic (fuzzy matching)
- [ ] Source reference linking

**Acceptance Criteria:**
- Extracts concepts at all 3 abstraction levels
- Correctly links concepts to source locations
- Deduplication accuracy >90%
- Handles LLM response variations gracefully

---

### BE-3.3: Clustering Engine
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** BE-3.2  
**Blocks:** Frontend Screen 2

**Description:**  
Cluster extracted concepts by theme/domain.

**Deliverables:**
- [ ] Domain classification (Energy, Biotech, Transportation, etc.)
- [ ] Theme tagging
- [ ] Cluster assignment algorithm
- [ ] Cross-domain relationship detection
- [ ] Cluster metadata generation (name, count, summary)

**Acceptance Criteria:**
- Concepts grouped into meaningful clusters
- No orphan concepts (all assigned to ≥1 cluster)
- Cluster names descriptive and unique

---

## 4. Market Analysis Engine

### BE-4.1: Analysis Prompt Builder
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** BE-1.2  
**Blocks:** BE-4.2

**Description:**  
Build LLM prompts for market analysis.

**Deliverables:**
- [ ] Market viability assessment prompt
- [ ] Technical feasibility assessment prompt
- [ ] Investment potential assessment prompt
- [ ] Composite scoring prompt
- [ ] Evidence citation requirements
- [ ] Output schema (scores + qualitative analysis)

**Acceptance Criteria:**
- Prompts produce all required sub-scores
- Qualitative analysis is substantive (not generic)
- Evidence citations reference actual search results

---

### BE-4.2: Analysis Processor
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 5 days  
**Dependencies:** BE-4.1, NET-1.1, NET-2.1  
**Blocks:** Frontend Screen 5

**Description:**  
Execute market analysis workflow.

**Deliverables:**
- [ ] Web search query generation from concept
- [ ] Search result aggregation and ranking
- [ ] LLM analysis execution with search context
- [ ] Score calculation and tier assignment
- [ ] Qualitative report generation
- [ ] Evidence linking to search results

**Acceptance Criteria:**
- Produces valid scores (0-100) for all dimensions
- Tier assignment matches score ranges
- Analysis completes in <120 seconds
- Handles search API failures gracefully

---

### BE-4.3: Validity Scorer
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** BE-4.2  
**Blocks:** Frontend Screen 5

**Description:**  
Calculate composite validity scores and tier assignments.

**Deliverables:**
- [ ] Weighted score calculation:
  - Market Viability (factors: gap 30%, timing 25%, regulatory 20%, trends 25%)
  - Technical Feasibility (factors: readiness 35%, breakthroughs 25%, infrastructure 20%, talent 20%)
  - Investment Potential (factors: capital 25%, timeline 25%, exits 25%, climate 25%)
- [ ] Composite score formula
- [ ] Tier assignment (T1: 75-100, T2: 50-74, T3: 25-49, T4: 0-24)
- [ ] Score normalization

**Acceptance Criteria:**
- Scores mathematically correct per weights
- Tier boundaries enforced correctly
- Sub-scores available alongside composite

---

## 5. Visualization Data Engine

### BE-5.1: Timeline Data Generator
**Priority:** P1 (High)  
**Estimated Effort:** 4 days  
**Dependencies:** BE-3.2, NET-1.1  
**Blocks:** Frontend Screen 6

**Description:**  
Generate branching tree data structure for concept evolution.

**Deliverables:**
- [ ] Origin identification from source material
- [ ] Evolution event extraction
- [ ] Branching point detection (variations, derivatives)
- [ ] Merge point detection (concept combinations)
- [ ] Future projection node generation
- [ ] Date/era assignment (exact, year, decade, estimated)
- [ ] TimelineNode and TimelineEdge record creation

**Acceptance Criteria:**
- Tree structure is valid (no cycles except explicit merges)
- Nodes properly typed (ORIGIN, VARIATION, MERGE, CURRENT, PROJECTED)
- Edges have valid relationship types
- Dates assigned with appropriate precision flags

---

### BE-5.2: Node Map Data Generator
**Priority:** P1 (High)  
**Estimated Effort:** 4 days  
**Dependencies:** BE-3.2, BE-4.2, NET-2.1  
**Blocks:** Frontend Screen 6

**Description:**  
Generate interactive node map data structure.

**Deliverables:**
- [ ] Multi-type node creation:
  - Concepts (from extraction)
  - Patents (from search)
  - Publications (from search)
  - People/Inventors (from extraction + search)
  - Companies/Orgs (from extraction + search)
  - Events/Milestones (from extraction + search)
- [ ] Edge relationship mapping:
  - Created/Invented, Referenced/Cited, Funded/Invested, Employed/Affiliated, Competed/Opposed
- [ ] Initial layout position calculation
- [ ] Node importance scoring (for sizing)

**Acceptance Criteria:**
- All node types populated where data exists
- Edges correctly typed
- No orphan nodes (all connected to ≥1 other node)
- Layout positions don't overlap

---

## 6. Asset Generation Engine

### BE-6.1: Document Generator
**Priority:** P1 (High)  
**Estimated Effort:** 5 days  
**Dependencies:** BE-4.2, NET-1.1  
**Blocks:** Frontend Screen 4 asset actions

**Description:**  
Generate document assets from concept data.

**Deliverables:**
- [ ] Template system for each document type:
  - Executive Summary (PDF)
  - Pitch Deck (PDF/PPTX structure)
  - One-Pager (PDF)
  - Technical Brief (PDF)
  - Market Analysis Report (PDF)
  - Whitepaper (PDF)
- [ ] LLM content generation with provenance markers
- [ ] PDF generation library integration
- [ ] Provenance chain attachment

**Acceptance Criteria:**
- All 6 document types generatable
- Professional formatting
- Provenance chain complete for all claims
- Generation time <30 seconds per document

---

### BE-6.2: Visual Generator
**Priority:** P1 (High)  
**Estimated Effort:** 4 days  
**Dependencies:** BE-4.2, BE-5.1, BE-5.2  
**Blocks:** Frontend Screen 4 asset actions

**Description:**  
Generate static visual assets.

**Deliverables:**
- [ ] Infographic generator (concept summary)
- [ ] Concept diagram generator (relationships)
- [ ] Timeline graphic export (from tree data)
- [ ] Comparison chart generator
- [ ] Data visualization generator (scores, trends)
- [ ] SVG and PNG output support
- [ ] Provenance linking for data-driven visuals

**Acceptance Criteria:**
- All 5 visual types generatable
- Consistent with UI design system (colors, typography)
- SVG exports are scalable
- PNG exports at 2x resolution for clarity

---

### BE-6.3: Provenance Tracker
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** BE-6.1, BE-6.2  
**Blocks:** Frontend Screen 4

**Description:**  
Track and store source-to-claim provenance chains.

**Deliverables:**
- [ ] Claim extraction from generated content
- [ ] Source reference linking
- [ ] Confidence scoring per claim
- [ ] Synthesis notes generation
- [ ] ProvenanceChain record persistence

**Acceptance Criteria:**
- Every claim traceable to ≥1 source
- Confidence scores reflect evidence strength
- Synthesis notes explain interpretation

---

## 7. Queue Management System

### BE-7.1: Job Queue Implementation
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** BE-1.3  
**Blocks:** BE-7.2, Frontend Screen 3

**Description:**  
Implement analysis job queue with persistence.

**Deliverables:**
- [ ] Queue data structure (FIFO)
- [ ] Job states: QUEUED, PROCESSING, COMPLETED, FAILED
- [ ] Persistence to IndexedDB (survives page reload)
- [ ] Add/remove/reorder operations
- [ ] Concurrency limit (1 active job)

**Acceptance Criteria:**
- Queue persists across sessions
- State transitions correct
- Only 1 job processing at a time
- Jobs can be cancelled while queued

---

### BE-7.2: Job Processor
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** BE-7.1, BE-4.2  
**Blocks:** Frontend Screen 3 progress

**Description:**  
Process queued analysis jobs.

**Deliverables:**
- [ ] Job executor with phase tracking:
  1. "Searching market trends..."
  2. "Analyzing technical feasibility..."
  3. "Evaluating investment potential..."
  4. "Generating visualizations..."
  5. "Compiling report..."
- [ ] Progress event emission (percentage + phase label)
- [ ] Error handling with job failure state
- [ ] Automatic advancement to next queued job
- [ ] Offline detection and pause

**Acceptance Criteria:**
- Progress events emitted at each phase
- Failed jobs don't block queue
- Resumes on reconnection
- Phase labels match spec exactly

---

## 8. Search & Filter Engine

### BE-8.1: Full-Text Search Index
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** BE-1.3, BE-3.2  
**Blocks:** Frontend global search

**Description:**  
Implement client-side full-text search.

**Deliverables:**
- [ ] Search index builder (on concept save)
- [ ] Indexed fields: name, description, themes, domain
- [ ] Fuzzy matching support
- [ ] Result ranking by relevance
- [ ] Search highlighting data

**Acceptance Criteria:**
- Search returns in <500ms for 2000+ concepts
- Partial word matching works
- Results ranked sensibly

---

### BE-8.2: Filter Engine
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** BE-1.3  
**Blocks:** Frontend filter UI

**Description:**  
Implement concept/result filtering.

**Deliverables:**
- [ ] Filter by abstraction level (L1/L2/L3)
- [ ] Filter by domain (multi-select)
- [ ] Filter by validity tier (T1/T2/T3/T4)
- [ ] Filter by date range (ingested, analyzed)
- [ ] Filter by source file
- [ ] Compound filter logic (AND between categories)

**Acceptance Criteria:**
- All filter types functional
- Filters combinable
- Filter application is instant (<100ms)

---

## Dependency Graph

```
BE-1.1 ─┬─▶ BE-1.3 ─┬─▶ BE-7.1 ──▶ BE-7.2
        │           │
BE-1.2 ─┴───────────┼─▶ BE-2.1 ──▶ BE-2.2 ─┬─▶ BE-2.5 ──▶ BE-3.1 ──▶ BE-3.2 ──▶ BE-3.3
                    │             BE-2.3 ─┤                           │
                    │             BE-2.4 ─┘                           │
                    │                                                 │
                    ├─▶ BE-4.1 ──▶ BE-4.2 ──▶ BE-4.3                 │
                    │               │                                 │
                    │               └──────────┬──────────────────────┘
                    │                          │
                    │                          ▼
                    │                    BE-5.1, BE-5.2
                    │                          │
                    │                          ▼
                    │                    BE-6.1, BE-6.2 ──▶ BE-6.3
                    │
                    └─▶ BE-8.1, BE-8.2

External Dependencies (from Network team):
- BE-2.2 requires NET-1.1 (LLM API) for OCR
- BE-2.3 requires NET-1.2 (Transcription API), NET-1.3 (Vision API)
- BE-3.2 requires NET-1.1 (LLM API)
- BE-4.2 requires NET-1.1 (LLM API), NET-2.1 (Web Search)
- BE-5.2 requires NET-2.1 (Web Search)
- BE-6.1 requires NET-1.1 (LLM API)
```

---

## Sprint Recommendations

### Sprint 1 (Foundation)
- BE-1.1, BE-1.2, BE-1.3
- BE-2.1

### Sprint 2 (Processing Pipeline)
- BE-2.2, BE-2.3, BE-2.4, BE-2.5
- BE-7.1

### Sprint 3 (Extraction & Analysis)
- BE-3.1, BE-3.2, BE-3.3
- BE-4.1, BE-4.2, BE-4.3
- BE-7.2

### Sprint 4 (Visualization & Assets)
- BE-5.1, BE-5.2
- BE-6.1, BE-6.2, BE-6.3

### Sprint 5 (Search & Polish)
- BE-8.1, BE-8.2
- Bug fixes, optimization

---

## Notes for Backend Team

1. **Web Workers are mandatory** for file processing — do not block main thread
2. **LLM responses are unpredictable** — implement robust parsing with fallbacks
3. **Storage can grow large** — implement lazy loading for file blobs
4. **Offline queue must persist** — test IndexedDB reliability across browsers
5. **Coordinate with Network team** — API abstractions must match their interfaces

---

**END OF BACKEND TASK LIST**
