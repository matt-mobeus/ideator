# IDEATOR — Product Specification Document

**Version:** 1.0  
**Date:** January 28, 2026  
**Status:** Ready for Implementation

---

## 1. Executive Summary

### 1.1 Purpose

IDEATOR is a concept-mining and analysis platform designed to resurface ideas ahead of their time from source materials, evaluate them against current market conditions, and generate actionable outputs for potential recapitalization.

### 1.2 Core Mission

To mine the digital expanse for ideas ahead of their time, and resurrect those ideas for potential recapitalization.

### 1.3 Target Audience

Entrepreneurs seeking identification of disruptive technologies and innovative investment opportunities.

### 1.4 Platform Type

Progressive Web Application (PWA) — browser-based, installable, with offline caching for previously viewed data.

---

## 2. System Architecture

### 2.1 Deployment Model

| Attribute | Specification |
|-----------|---------------|
| Type | Progressive Web Application (PWA) |
| Installation | Optional install via browser |
| User Model | Single-user local instance, no authentication required |
| Data Storage | Browser local storage / IndexedDB |
| Persistence | Full — all uploads, concepts, analyses, and generated assets persist across sessions |

### 2.2 Connectivity Requirements

| State | Capabilities |
|-------|--------------|
| Online | Full functionality — ingestion, extraction, analysis, generation |
| Offline | View-only for cached data; new file uploads queue for processing when reconnected |

### 2.3 AI/LLM Backend

| Attribute | Specification |
|-----------|---------------|
| Provider | Agnostic — specification defines capability requirements, implementation selects provider |
| Connection | Cloud-based API (requires internet) |
| Capabilities Required | Text comprehension, concept extraction, summarization, trend analysis, content generation, image understanding, audio transcription |

### 2.4 Responsive Design

| Breakpoint | Support Level |
|------------|---------------|
| Desktop (≥1024px) | Full functionality, optimized layout |
| Tablet (768px–1023px) | Full functionality, adapted layout |
| Mobile (<768px) | Not supported — display "Please use a desktop or tablet device" message |

---

## 3. Data Ingestion System

### 3.1 Upload Methods

**Method 1: Direct File Upload**
- Drag-and-drop zone
- File picker dialog
- No file size limits
- No file quantity limits
- Processing time scales with volume

**Method 2: Google Drive Folder Link**
- One-time snapshot import (not live sync)
- User authenticates via OAuth
- All supported files in folder are imported at time of linking
- Subfolder handling: Flatten all files into single import batch

### 3.2 Supported File Formats

#### Primary: Text Documents (Full Processing)

| Format | Extension | Notes |
|--------|-----------|-------|
| PDF | .pdf | Native text extraction + OCR for scanned pages |
| Microsoft Word | .docx, .doc | Full content extraction |
| Plain Text | .txt | Direct processing |
| Rich Text | .rtf | Formatting stripped, text retained |
| EPUB | .epub | E-book content extraction |
| Markdown | .md | Native support |
| HTML | .html, .htm | Tag stripping, content extraction |
| LaTeX | .tex | Academic paper processing |
| Patent Filings | Various | Specialized parsing for claims, descriptions, figures |
| Scanned Documents | Image-based PDFs | OCR processing required |

#### Primary: Multimedia (Full Processing)

| Format | Extension | Processing |
|--------|-----------|------------|
| Video | .mp4, .mov, .webm, .avi | Audio transcription + visual frame analysis (on-screen text, diagrams, slides) |
| Audio | .mp3, .wav, .m4a, .ogg | Speech-to-text transcription |
| Presentations | .pptx, .ppt, .key | Slide content + speaker notes extraction |
| Images | .png, .jpg, .jpeg, .gif, .webp, .tiff | OCR for text/diagrams, visual analysis |

#### Secondary: Structured Data (Basic Support)

| Format | Extension | Processing |
|--------|-----------|------------|
| Spreadsheets | .xlsx, .xls, .csv | Tabular data extraction, header detection |
| JSON | .json | Structured data parsing |

### 3.3 Processing Pipeline

```
[File Upload] 
    ↓
[Format Detection]
    ↓
[Format-Specific Extraction]
    ├── Text → Direct parsing
    ├── PDF → Text extraction + OCR fallback
    ├── Video → Frame sampling + audio transcription
    ├── Audio → Speech-to-text
    ├── Image → OCR + visual analysis
    └── Structured → Schema detection + parsing
    ↓
[Unified Text Corpus]
    ↓
[Concept Extraction Queue]
```

---

## 4. Concept Extraction Engine

### 4.1 Concept Definition

A "concept" in IDEATOR operates at multiple abstraction levels:

| Level | Description | Example |
|-------|-------------|---------|
| L1: Specific Technology | Discrete inventions, mechanisms, implementations | "Pneumatic tube delivery," "Modular nuclear microreactors" |
| L2: Technical Approach | Methods, architectures, design patterns | "Swarm robotics," "Distributed consensus algorithms" |
| L3: Paradigm/Framework | Broad organizing principles, philosophies | "Biomimicry in manufacturing," "Decentralized governance" |

The system extracts concepts at all three levels and maintains hierarchical relationships between them.

### 4.2 Extraction Process

```
[Unified Text Corpus]
    ↓
[LLM Analysis Pass 1: Entity Recognition]
    → Technologies, inventions, methods, principles
    ↓
[LLM Analysis Pass 2: Abstraction Mapping]
    → Assign each entity to L1/L2/L3
    → Identify parent-child relationships
    ↓
[LLM Analysis Pass 3: Clustering]
    → Group by theme/domain
    → Detect cross-domain connections
    ↓
[Concept Registry]
    → Unique ID per concept
    → Source provenance links
    → Abstraction level tag
    → Cluster assignment
```

### 4.3 Concept Data Model

```
Concept {
    id: UUID
    name: String
    description: String (2-3 sentences)
    abstraction_level: Enum [L1_SPECIFIC, L2_APPROACH, L3_PARADIGM]
    domain: String (e.g., "Biotechnology", "Energy", "Transportation")
    themes: String[] (e.g., ["sustainability", "automation"])
    parent_concepts: UUID[] (higher abstraction links)
    child_concepts: UUID[] (lower abstraction links)
    related_concepts: UUID[] (same-level associations)
    source_references: SourceRef[]
    extraction_timestamp: DateTime
    cluster_id: UUID
}

SourceRef {
    file_id: UUID
    file_name: String
    location: String (page number, timestamp, slide number)
    excerpt: String (verbatim quote, max 500 chars)
    context: String (surrounding context summary)
}
```

---

## 5. Market Analysis Engine

### 5.1 Analysis Trigger

Analysis is triggered manually by the user on individual concepts (one at a time). Users may queue multiple concepts for sequential processing.

### 5.2 Trend Data Acquisition

**Method:** Real-time web search at analysis time

| Search Domain | Purpose |
|---------------|---------|
| News aggregators | Recent developments, announcements |
| Patent databases | Active filings, competitive landscape |
| Academic repositories | Research momentum, publication trends |
| Investment news | Funding rounds, M&A activity |
| Industry publications | Expert commentary, market reports |
| Social/professional networks | Sentiment, emerging discussions |

### 5.3 Validity Assessment Framework

The system produces a composite validity score with three sub-dimensions:

#### 5.3.1 Market Viability Score

| Factor | Weight | Assessment Criteria |
|--------|--------|---------------------|
| Market Gap | 30% | Is there unmet demand? Competitor saturation? |
| Timing | 25% | Is market ready now vs. too early/late? |
| Regulatory Environment | 20% | Barriers, enablers, pending legislation |
| Adjacent Trends | 25% | Complementary technologies/movements gaining traction |

#### 5.3.2 Technical Feasibility Score

| Factor | Weight | Assessment Criteria |
|--------|--------|---------------------|
| Current Technology Readiness | 35% | Can it be built with existing tech? |
| Required Breakthroughs | 25% | What advances are needed? How close? |
| Infrastructure Dependencies | 20% | What must exist for deployment? |
| Talent Availability | 20% | Are skilled practitioners available? |

#### 5.3.3 Investment Potential Score

| Factor | Weight | Assessment Criteria |
|--------|--------|---------------------|
| Capital Efficiency | 25% | Cost to validate/scale |
| Return Timeline | 25% | Expected time to liquidity |
| Exit Pathways | 25% | Acquisition targets, IPO viability |
| Funding Climate | 25% | Investor appetite in this domain |

### 5.4 Validity Output Format

**At-a-Glance:** Tiered rating system

| Tier | Label | Composite Score Range | Visual Indicator |
|------|-------|----------------------|------------------|
| T1 | High Potential | 75-100 | Green glow |
| T2 | Moderate Potential | 50-74 | Yellow/amber glow |
| T3 | Low Potential | 25-49 | Orange glow |
| T4 | Not Viable | 0-24 | Red glow |

**Drill-Down:** Full qualitative report containing:
- Executive summary (3-5 sentences)
- Market viability analysis (paragraph + sub-score breakdown)
- Technical feasibility analysis (paragraph + sub-score breakdown)
- Investment potential analysis (paragraph + sub-score breakdown)
- Key risks and uncertainties
- Recommended next steps
- Supporting evidence citations with source links

---

## 6. Visualization System

### 6.1 Visualization Modes

IDEATOR provides two complementary visualization modes for exploring concept origin, evolution, and future potential.

#### 6.1.1 Branching Tree/Graph View

**Purpose:** Show how concepts spawned variations, merged with others, or evolved over time.

**Structure:**
- Root node: Original concept as identified in source material
- Branch nodes: Variations, implementations, derivative concepts
- Merge points: Where concepts combined or influenced each other
- Leaf nodes: Current/latest manifestations
- Future projection nodes (dashed): Predicted evolutionary paths

**Visual Encoding:**
- Node size: Significance/impact score
- Node color: Domain/theme
- Edge thickness: Strength of derivation relationship
- Edge style: Solid (confirmed), dashed (inferred/predicted)
- Timeline position: Horizontal axis represents time

**Interactions:**
- Zoom in/out
- Pan across timeline
- Click node to select and view details
- Hover for quick summary tooltip
- Collapse/expand branches

#### 6.1.2 Interactive Node Map View

**Purpose:** Enable non-linear exploration through connected events, patents, publications, and people.

**Node Types:**
| Type | Icon | Color Code |
|------|------|------------|
| Concept | Hexagon | Cyan |
| Patent | Shield | Magenta |
| Publication | Document | Green |
| Person/Inventor | Circle | Orange |
| Company/Org | Square | Yellow |
| Event/Milestone | Diamond | White |

**Edge Types:**
| Relationship | Line Style |
|--------------|------------|
| Created/Invented | Solid arrow |
| Referenced/Cited | Dotted line |
| Funded/Invested | Dashed line |
| Employed/Affiliated | Thin solid |
| Competed/Opposed | Red dashed |

**Interactions:**
- Click node to center and expand connections
- Double-click to drill down into node detail
- Right-click for context menu (hide, highlight path, find connections)
- Search within map
- Filter by node type, date range, relationship type
- Save/load map positions

### 6.2 Timeline Data Model

```
TimelineNode {
    id: UUID
    concept_id: UUID
    node_type: Enum [ORIGIN, VARIATION, MERGE, CURRENT, PROJECTED]
    label: String
    date: Date (exact or approximate)
    date_precision: Enum [EXACT, YEAR, DECADE, ESTIMATED]
    description: String
    source_refs: SourceRef[]
    position: {x: Number, y: Number} (for node map)
}

TimelineEdge {
    id: UUID
    source_node_id: UUID
    target_node_id: UUID
    relationship_type: Enum [DERIVED, MERGED, INFLUENCED, CITED, FUNDED, etc.]
    strength: Number (0-1)
    evidence: String
    source_refs: SourceRef[]
}
```

---

## 7. Asset Generation System

### 7.1 Supported Output Types

#### 7.1.1 Documents

| Asset Type | Format | Use Case |
|------------|--------|----------|
| Executive Summary | PDF | Quick overview for stakeholders |
| Pitch Deck | PDF/PPTX | Investor presentations |
| One-Pager | PDF | Rapid concept communication |
| Technical Brief | PDF | Engineering/R&D audience |
| Market Analysis Report | PDF | Due diligence documentation |
| Whitepaper | PDF | Thought leadership, deep dives |

#### 7.1.2 Static Visuals

| Asset Type | Format | Use Case |
|------------|--------|----------|
| Infographic | PNG/SVG | Social sharing, presentations |
| Concept Diagram | PNG/SVG | Technical documentation |
| Timeline Graphic | PNG/SVG | Historical context visualization |
| Comparison Chart | PNG/SVG | Competitive analysis |
| Data Visualization | PNG/SVG | Quantitative insights |

### 7.2 Provenance Chain

Every generated asset maintains full traceability to source material:

```
GeneratedAsset {
    id: UUID
    asset_type: Enum
    concept_id: UUID
    file_path: String
    generated_timestamp: DateTime
    provenance: ProvenanceChain
}

ProvenanceChain {
    claims: Claim[]
}

Claim {
    statement: String (the assertion made in the asset)
    source_refs: SourceRef[] (exact locations in source material)
    confidence: Number (0-1)
    synthesis_notes: String (how sources were combined/interpreted)
}
```

### 7.3 Generation Workflow

```
[User selects concept]
    ↓
[User selects asset type]
    ↓
[System retrieves concept data + source material]
    ↓
[LLM generates content with inline provenance markers]
    ↓
[Template application (formatting, branding)]
    ↓
[Provenance validation check]
    ↓
[Asset saved to local storage]
    ↓
[User can export/download]
```

---

## 8. User Interface Specification

### 8.1 Design System

#### 8.1.1 Visual Aesthetic

**Theme:** Tron-like wireframe with glowing nodes and grid patterns

| Element | Specification |
|---------|---------------|
| Background | Near-black (#0a0a0f to #12121a gradient) |
| Grid | Subtle perspective grid, low opacity (#1a1a2e at 10-20% opacity) |
| Wireframes | 1-2px strokes, glowing effect via subtle drop shadow |
| Depth | Layered panels with slight elevation differences |
| Typography | Monospace or geometric sans-serif (e.g., "JetBrains Mono", "Orbitron", "Rajdhani") |

#### 8.1.2 Color Palette — Functional Coding

| Function | Primary Color | Hex | Usage |
|----------|--------------|-----|-------|
| Navigation | Cyan | #00FFFF | Headers, nav elements, primary actions |
| Warnings/Alerts | Orange | #FF6600 | Errors, warnings, attention required |
| Validity/Success | Green | #00FF88 | High potential, confirmations, valid states |
| Creativity/Generation | Magenta | #FF00FF | Asset generation, AI actions, insights |
| Data/Information | Blue | #4488FF | Data displays, informational elements |
| Neutral/Secondary | Gray | #888899 | Disabled states, secondary text |

#### 8.1.3 Animation Philosophy

**Approach:** Subtle micro-interactions only — no persistent ambient animations

| Interaction | Animation |
|-------------|-----------|
| Hover states | Soft glow intensification (150ms ease) |
| Button press | Scale down 98% + glow pulse (100ms) |
| Screen transitions | Fade + slight slide (200ms ease-out) |
| Loading indicators | Pulsing glow or spinner |
| Data population | Staggered fade-in (50ms delay per item) |
| Notifications | Slide in from edge + fade |

### 8.2 Central Viewer Component

The central viewer is the primary content display area, designed for drill-down/up information delivery.

#### 8.2.1 Layout Structure

**Unified Canvas** — multiple media types visible simultaneously

```
┌─────────────────────────────────────────────────────────────┐
│  BREADCRUMB NAVIGATION (drill level indicator)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │                     │  │                             │  │
│  │   PRIMARY PANEL     │  │      SECONDARY PANEL        │  │
│  │   (reactive to      │  │      (contextual info,      │  │
│  │    content type)    │  │       source excerpts)      │  │
│  │                     │  │                             │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    TERTIARY STRIP                     │  │
│  │         (metadata, scores, quick actions)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 8.2.2 Panel Reactivity by Content Type

| Content Type | Primary Panel | Secondary Panel |
|--------------|---------------|-----------------|
| Concept Overview | Summary card + validity tier | Related concepts list |
| Visualization | Tree/Node map (interactive) | Node detail on selection |
| Analysis Report | Scrollable report text | Evidence citations |
| Source Material | Document/media viewer | Extracted concepts sidebar |
| Generated Asset | Asset preview | Provenance chain |

#### 8.2.3 Drill Hierarchy (4+ Levels)

| Level | Content | Navigation |
|-------|---------|------------|
| L0: Overview | All concepts (clustered view) | Entry point |
| L1: Concept Detail | Single concept summary, validity tier, visualizations | Click concept from L0 |
| L2: Sub-components | Breakdown of concept elements, related patents/publications | Click "Explore Details" or node in visualization |
| L3: Technical Specs | Deep technical information (adaptive depth based on source richness) | Click "Technical Deep-Dive" |
| L4: Raw Source | Original source material with highlighted relevant passages | Click any source citation |

**Navigation Controls:**
- Breadcrumb trail (always visible, clickable)
- Back button (keyboard: Backspace or Escape)
- Level indicator (L0/L1/L2/L3/L4 badge)

---

## 9. Screen-by-Screen Specification

### 9.1 Screen 1: Upload & Ingest

**URL Path:** `/upload`

**Purpose:** Allow users to upload source material or link Google Drive folders.

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  IDEATOR                                    [Settings] [?]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ╔═══════════════════════════════════╗          │
│              ║                                   ║          │
│              ║      DRAG & DROP FILES HERE       ║          │
│              ║                                   ║          │
│              ║         or click to browse        ║          │
│              ║                                   ║          │
│              ║   ─────────── OR ───────────      ║          │
│              ║                                   ║          │
│              ║   [🔗 Link Google Drive Folder]   ║          │
│              ║                                   ║          │
│              ╚═══════════════════════════════════╝          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  UPLOAD QUEUE                                    0/0  │  │
│  │  (empty state: "No files in queue")                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                              [BEGIN INGESTION →]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components

**Drop Zone**
- Dashed wireframe border (cyan glow on hover/dragover)
- Accepts multiple files
- Shows file type icons on drop
- Validates format on drop, rejects unsupported with toast notification

**Google Drive Link Button**
- Opens OAuth flow in popup
- After auth, shows folder picker
- Displays folder name + file count after selection

**Upload Queue**
- List of pending files with: filename, size, format icon, [✕] remove button
- Running total: file count and total size
- Clear all button

**Begin Ingestion Button**
- Disabled until ≥1 file in queue
- On click: transition to processing state, then auto-navigate to Screen 2 when complete

#### States

| State | Behavior |
|-------|----------|
| Empty | Drop zone prominent, queue collapsed |
| Files Queued | Queue expanded, "Begin Ingestion" enabled |
| Processing | Progress overlay with step indicator, queue locked |
| Complete | Auto-navigate to Screen 2 |
| Error | Toast notification with retry option |

---

### 9.2 Screen 2: Concept Population

**URL Path:** `/concepts`

**Purpose:** Display extracted concepts clustered by theme/domain/abstraction level.

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  IDEATOR    [Search... 🔍]    [Filters ▼]     [⚙] [+ New]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CLUSTERS                              CONCEPT COUNT: 47    │
│                                                             │
│  ┌─ BIOTECHNOLOGY ──────────────────────────────────────┐  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │  │
│  │  │Concept │ │Concept │ │Concept │ │Concept │  +3     │  │
│  │  │  Card  │ │  Card  │ │  Card  │ │  Card  │         │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ ENERGY ─────────────────────────────────────────────┐  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐                    │  │
│  │  │Concept │ │Concept │ │Concept │                    │  │
│  │  │  Card  │ │  Card  │ │  Card  │                    │  │
│  │  └────────┘ └────────┘ └────────┘                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ TRANSPORTATION ─────────────────────────────────────┐  │
│  │  ...                                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components

**Search Bar**
- Instant filter as user types
- Searches: concept name, description, themes, domain

**Filters Dropdown**
- Abstraction level (L1/L2/L3)
- Domain (multi-select)
- Date ingested (range picker)
- Source file (multi-select)

**Cluster Container**
- Collapsible (click header to toggle)
- Header shows: domain name, concept count
- Horizontal scroll if >4 concepts
- "+N" indicator for overflow

**Concept Card**
- Fixed size: 180px × 220px
- Content: name (truncate with ellipsis), 2-line description, abstraction level badge, source count
- Hover: subtle glow, show "Analyze →" button
- Click: navigate to Screen 3 (analysis trigger)

**[+ New] Button**
- Returns to Screen 1 to add more source material

---

### 9.3 Screen 3: Analysis Trigger

**URL Path:** `/analyze/:conceptId`

**Purpose:** Display selected concept details and allow user to trigger market analysis.

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Concepts                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │   CONCEPT NAME                                      │   │
│  │   ═══════════════════════════════════════════════   │   │
│  │                                                     │   │
│  │   Description text goes here, providing a brief     │   │
│  │   overview of the concept as extracted from the     │   │
│  │   source material...                                │   │
│  │                                                     │   │
│  │   Abstraction: [L2: Technical Approach]             │   │
│  │   Domain: Energy                                    │   │
│  │   Themes: sustainability, grid infrastructure       │   │
│  │                                                     │   │
│  │   Sources: 3 files                                  │   │
│  │   ┌──────────────────────────────────────────────┐ │   │
│  │   │ • whitepaper_2019.pdf (pp. 12-15, 34)        │ │   │
│  │   │ • lecture_recording.mp4 (12:34-15:20)        │ │   │
│  │   │ • patent_US10234567.pdf (Claims 1-4)         │ │   │
│  │   └──────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│         ╔════════════════════════════════════════╗          │
│         ║      [⚡ RUN MARKET ANALYSIS]          ║          │
│         ╚════════════════════════════════════════╝          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ANALYSIS QUEUE                                       │  │
│  │  1. Modular Reactors ████████░░ Scoring viability... │  │
│  │  2. Pneumatic Delivery ░░░░░░░░░░ Queued             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components

**Concept Detail Card**
- Full concept information display
- Clickable source references (opens source in viewer overlay)
- Related concepts links (navigate to their analysis screens)

**Run Market Analysis Button**
- Prominent CTA with glow effect
- On click: adds to queue, starts processing if queue was empty
- Disabled if concept already in queue or already analyzed

**Analysis Queue**
- Shows all queued/in-progress analyses
- Progress bar with phase label for active item:
  - "Searching market trends..."
  - "Analyzing technical feasibility..."
  - "Evaluating investment potential..."
  - "Generating visualizations..."
  - "Compiling report..."
- Click completed item → navigate to Screen 5 results
- [✕] button to cancel queued (not in-progress) items

---

### 9.4 Screen 4: Source-to-Asset Mapping

**URL Path:** `/provenance/:conceptId`

**Purpose:** Review how source material maps to generated insights and assets.

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                            Concept: [Name]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ SOURCE MATERIAL ────────────┬─ GENERATED CLAIMS ─────┐ │
│  │                              │                         │ │
│  │  whitepaper_2019.pdf        │  "The technology was    │ │
│  │  ════════════════════       │   first proposed in     │ │
│  │                              │   1987..."              │ │
│  │  Page 12:                    │   ← linked              │ │
│  │  ┌────────────────────────┐ │                         │ │
│  │  │ "Initial experiments   │ │  "Market conditions     │ │
│  │  │  demonstrated the      │ │   now favor adoption    │ │
│  │  │  feasibility of..."    │──┼───due to..."           │ │
│  │  └────────────────────────┘ │   ← linked              │ │
│  │                              │                         │ │
│  │  Page 34:                    │  "Technical barriers    │ │
│  │  ┌────────────────────────┐ │   have been reduced     │ │
│  │  │ "Cost projections      │──┼───by 60%..."           │ │
│  │  │  indicated..."         │ │   ← linked              │ │
│  │  └────────────────────────┘ │                         │ │
│  │                              │                         │ │
│  │  lecture_recording.mp4      │                         │ │
│  │  ════════════════════       │                         │ │
│  │  12:34-15:20:               │                         │ │
│  │  ┌────────────────────────┐ │                         │ │
│  │  │ [▶ Play clip]          │──┼───"Expert commentary   │ │
│  │  │ Transcript: "The key   │ │   supports..."          │ │
│  │  │ insight here is..."    │ │                         │ │
│  │  └────────────────────────┘ │                         │ │
│  │                              │                         │ │
│  └──────────────────────────────┴─────────────────────────┘ │
│                                                             │
│  [View Full Report]           [Generate Assets →]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components

**Source Panel (Left)**
- Grouped by source file
- Expandable excerpts with line highlighting
- Audio/video clips with inline playback
- Click excerpt to view in context (overlay)

**Claims Panel (Right)**
- All generated assertions from analysis
- Visual connection lines to source excerpts
- Confidence indicator per claim
- Click claim to highlight all supporting sources

**Connection Visualization**
- Animated lines connecting sources to claims on hover
- Color-coded by confidence level
- Bi-directional highlighting

**Action Buttons**
- "View Full Report" → Screen 5
- "Generate Assets" → Asset generation modal

---

### 9.5 Screen 5: All Results

**URL Path:** `/results`

**Purpose:** Comprehensive view of all analyzed concepts and their outcomes.

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  IDEATOR    [Search... 🔍]    [Filters ▼]    [Export ↓]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ANALYSIS RESULTS                          27 concepts      │
│                                                             │
│  Sort: [Validity Score ▼]  [Date ▼]  [Domain ▼]            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ███ HIGH POTENTIAL (8)                         [−]   │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Modular Nuclear Microreactors                  │  │  │
│  │  │ Domain: Energy | Score: 87 | ████████▓░        │  │  │
│  │  │ "Significant market gap with regulatory..."    │  │  │
│  │  │ [View Details] [Generate Assets] [Explore]     │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Distributed Water Purification                 │  │  │
│  │  │ Domain: Infrastructure | Score: 82 | ████████░░│  │  │
│  │  │ "Emerging markets show strong demand..."       │  │  │
│  │  │ [View Details] [Generate Assets] [Explore]     │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ...                                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ██░ MODERATE POTENTIAL (12)                    [+]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ █░░ LOW POTENTIAL (5)                          [+]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ░░░ NOT VIABLE (2)                             [+]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components

**Advanced Search & Filter**
- Text search across names, descriptions, domains
- Filters: validity tier, score range, domain, abstraction level, date analyzed

**Sort Controls**
- Validity score (default: descending)
- Date analyzed
- Domain (alphabetical)
- Name (alphabetical)

**Tier Sections**
- Collapsible accordion per validity tier
- Color-coded header (green/yellow/orange/red glow)
- Count badge

**Result Cards**
- Concept name, domain, score bar visualization
- One-line summary excerpt
- Quick action buttons:
  - "View Details" → Slide-out panel with full report
  - "Generate Assets" → Asset generation modal
  - "Explore" → Navigate to Screen 6

**Export Button**
- Exports generated assets only (per spec)
- Formats: ZIP containing all PDFs, PNGs, SVGs
- Option to select specific concepts/assets

---

### 9.6 Screen 6: Concept Explorer (Deep Dive)

**URL Path:** `/explore/:conceptId`

**Purpose:** Interactive exploration of verified concepts with drill-down to technical specifications.

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back      L0 > L1 > L2 > L3                   [⚙] [?]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────┬───────────────────────┐  │
│  │                              │                       │  │
│  │                              │  DETAIL PANEL         │  │
│  │                              │  ═══════════════════  │  │
│  │    VISUALIZATION CANVAS      │                       │  │
│  │    (Branching Tree or        │  [Selected node       │  │
│  │     Interactive Node Map)    │   information         │  │
│  │                              │   displayed here]     │  │
│  │    [Toggle: Tree | Map]      │                       │  │
│  │                              │  Related:             │  │
│  │                              │  • Link 1             │  │
│  │                              │  • Link 2             │  │
│  │                              │                       │  │
│  │                              │  [Drill Down ↓]       │  │
│  │                              │                       │  │
│  └──────────────────────────────┴───────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SOURCE EXCERPTS & EVIDENCE                          │  │
│  │  Relevant passages from original material...          │  │
│  │  [Click to view in context]                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Components

**Breadcrumb Navigation**
- Shows current drill level (L0 → L1 → L2 → L3 → L4)
- Each level clickable to jump back
- Current level highlighted

**Visualization Canvas**
- Toggle between Branching Tree and Interactive Node Map
- Full interactivity (zoom, pan, click, hover)
- Node selection highlights in detail panel

**Detail Panel**
- Contextual based on selected node/level
- L1: Concept summary, validity scores
- L2: Component breakdown, relationships
- L3: Technical specifications (adaptive depth)
- L4: Raw source viewer

**Drill Down Button**
- Navigates to next level of detail
- Disabled at deepest available level
- Label changes based on context ("View Components", "Technical Specs", "View Source")

**Source Excerpts Strip**
- Horizontally scrollable
- Shows relevant excerpts for current selection
- Click to expand to full source view (L4)

#### Drill Hierarchy Detail

| Level | View Name | Content | Panel Shows |
|-------|-----------|---------|-------------|
| L0 | Overview | Full visualization of all concepts | Cluster statistics |
| L1 | Concept | Single concept visualization | Full report summary |
| L2 | Components | Sub-elements, patents, publications | Component details |
| L3 | Technical | Specifications, implementations | Technical data (adaptive) |
| L4 | Source | Original document/media viewer | Highlighted excerpts |

---

## 10. Global Components

### 10.1 Navigation

**Primary Navigation:** Persistent top bar

| Element | Behavior |
|---------|----------|
| Logo/Wordmark | Click → Screen 2 (or Screen 1 if no data) |
| Search | Global search modal (Cmd/Ctrl + K) |
| Settings | Settings modal |
| Help | Help/documentation overlay |

**Secondary Navigation:** Contextual based on screen

### 10.2 Settings Modal

| Setting | Options |
|---------|---------|
| Theme | Dark only (per spec), accent color minor variations |
| Data | Clear all data, export generated assets |
| About | Version, credits |

### 10.3 Notifications/Toasts

| Type | Color | Duration |
|------|-------|----------|
| Success | Green glow | 3 seconds |
| Info | Cyan glow | 4 seconds |
| Warning | Orange glow | 5 seconds |
| Error | Red glow | Persistent until dismissed |

### 10.4 Loading States

| Context | Indicator |
|---------|-----------|
| Page load | Full-screen grid animation |
| Section load | Skeleton wireframes |
| Button action | Inline spinner |
| Analysis progress | Step-by-step progress bar |

### 10.5 Empty States

| Screen | Empty State Message |
|--------|---------------------|
| Concepts (no data) | "No concepts yet. Upload source material to begin." [Upload →] |
| Results (no analyses) | "No analyses complete. Select concepts to analyze." [Browse Concepts →] |
| Search (no results) | "No matches found. Try different keywords or filters." |

---

## 11. Data Persistence & Storage

### 11.1 Storage Architecture

**Primary:** IndexedDB (via abstraction library like Dexie.js)

| Store | Contents |
|-------|----------|
| `files` | Uploaded file metadata + binary blobs |
| `concepts` | Extracted concept records |
| `analyses` | Market analysis results |
| `visualizations` | Generated timeline/node map data |
| `assets` | Generated documents and images |
| `provenance` | Source-to-claim mapping chains |
| `queue` | Pending analysis jobs |
| `settings` | User preferences |

### 11.2 Storage Limits

- Rely on browser IndexedDB limits (typically 50%+ of free disk space)
- No artificial caps imposed by application
- User warned when storage exceeds 1GB (informational only)

### 11.3 Offline Behavior

| Action | Online | Offline |
|--------|--------|---------|
| View cached data | ✓ | ✓ |
| Upload files | ✓ | Queued |
| Extract concepts | ✓ | Queued |
| Run analysis | ✓ | ✗ (requires API) |
| Generate assets | ✓ | ✗ (requires API) |
| Export assets | ✓ | ✓ (from cache) |

### 11.4 Data Export

**Scope:** Generated assets only (per specification)

**Format:** ZIP archive containing:
- `/documents/` — PDFs (pitch decks, summaries, reports)
- `/visuals/` — PNGs and SVGs (infographics, diagrams)
- `manifest.json` — Metadata linking assets to concepts

---

## 12. LLM Integration Specification

### 12.1 Required Capabilities

| Capability | Use Case |
|------------|----------|
| Long-context processing | Ingest large documents |
| Text comprehension | Extract concepts from diverse sources |
| Summarization | Generate concept descriptions |
| Structured output | JSON responses for data models |
| Web search integration | Real-time market trend analysis |
| Image understanding | OCR, diagram analysis, video frame extraction |
| Audio transcription | Video/podcast processing |
| Content generation | Reports, summaries, asset text |

### 12.2 Prompt Architecture

**Concept Extraction Prompt Template:**
```
System: You are a concept extraction specialist. Analyze the provided text and identify distinct technological concepts, innovations, methods, and paradigms. For each concept, provide:
- Name (concise title)
- Description (2-3 sentences)
- Abstraction level (L1: Specific Technology, L2: Technical Approach, L3: Paradigm/Framework)
- Domain classification
- Relevant themes (tags)

Output as JSON array.

User: [Source text content]
```

**Market Analysis Prompt Template:**
```
System: You are a market analyst evaluating the current viability of a historical/emerging concept. Using the provided web search results and concept information, assess:

1. Market Viability (score 0-100):
   - Market gap existence
   - Timing appropriateness
   - Regulatory environment
   - Adjacent trend alignment

2. Technical Feasibility (score 0-100):
   - Current technology readiness
   - Required breakthroughs
   - Infrastructure dependencies
   - Talent availability

3. Investment Potential (score 0-100):
   - Capital efficiency
   - Return timeline
   - Exit pathways
   - Funding climate

Provide scores, qualitative analysis, and supporting evidence.

User: 
Concept: [Name and description]
Web Search Results: [Structured search results]
```

### 12.3 API Call Patterns

| Operation | Estimated Calls | Notes |
|-----------|-----------------|-------|
| Concept extraction (per file) | 1-5 | Depends on file length |
| Market analysis (per concept) | 3-8 | Includes web searches |
| Asset generation (per asset) | 1-2 | Single generation + refinement |
| Visualization data | 1-2 | Structure generation |

### 12.4 Error Handling

| Error Type | User Message | Recovery |
|------------|--------------|----------|
| API timeout | "Analysis is taking longer than expected. Please wait..." | Auto-retry 2x, then offer manual retry |
| Rate limit | "Processing paused. Resuming in X seconds..." | Automatic backoff and resume |
| API error | "Analysis failed. Please try again." | Offer retry button |
| Network offline | "You're offline. Analysis will resume when connected." | Queue for later |

---

## 13. Performance Requirements

### 13.1 Load Time Targets

| Metric | Target |
|--------|--------|
| Initial page load (cached) | < 2 seconds |
| Initial page load (uncached) | < 4 seconds |
| Screen transitions | < 300ms |
| Search results | < 500ms |

### 13.2 Processing Time Expectations

| Operation | Expected Duration |
|-----------|-------------------|
| File upload (per 10MB) | < 5 seconds |
| Concept extraction (per file) | 10-60 seconds |
| Market analysis (per concept) | 30-120 seconds |
| Asset generation | 10-30 seconds |

### 13.3 Scalability Targets

| Metric | Minimum Support |
|--------|-----------------|
| Files per instance | 500+ |
| Concepts per instance | 2,000+ |
| Analyses per instance | 500+ |
| Generated assets | 1,000+ |

---

## 14. Accessibility Requirements

### 14.1 Standards

- WCAG 2.1 Level AA compliance target
- Keyboard navigation for all interactive elements
- Screen reader compatibility

### 14.2 Specific Requirements

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | 4.5:1 minimum for text on dark background |
| Focus indicators | Visible glow ring on focused elements |
| Alt text | All generated visuals include descriptions |
| Keyboard shortcuts | Documented, non-conflicting with browser |
| Reduced motion | Respect `prefers-reduced-motion` media query |

---

## 15. Security Considerations

### 15.1 Data Handling

| Data Type | Handling |
|-----------|----------|
| Uploaded files | Stored locally in IndexedDB, never transmitted except for processing |
| API keys | If user-provided, stored in secure local storage, never logged |
| Analysis results | Cached locally only |
| Generated assets | Local storage only, user controls export |

### 15.2 External Connections

| Connection | Purpose | Data Sent |
|------------|---------|-----------|
| LLM API | Processing | File content, concept data |
| Web search | Market trends | Search queries only |
| Google OAuth | Drive access | OAuth tokens only |

---

## 16. Future Considerations (Out of Scope for v1.0)

The following features are explicitly out of scope but documented for future reference:

- Multi-user/team collaboration
- Live Google Drive sync
- Mobile-responsive layout
- Local/on-device LLM processing
- Natural language search queries
- Video/animated asset generation
- Interactive artifact generation
- API/webhook integrations
- White-labeling/customization

---

## 17. Glossary

| Term | Definition |
|------|------------|
| Concept | A distinct idea, technology, method, or paradigm extracted from source material |
| Abstraction Level | The specificity hierarchy of a concept (L1: specific, L2: approach, L3: paradigm) |
| Validity Score | Composite assessment of market viability, technical feasibility, and investment potential |
| Provenance Chain | The traceable link between generated claims and original source material |
| Cluster | A grouping of related concepts by theme, domain, or abstraction level |
| Drill Down/Up | Navigation through hierarchical information levels |

---

## 18. Appendix: Wire Reference Diagrams

### A1. Application Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SCREEN 1  │────▶│   SCREEN 2  │────▶│   SCREEN 3  │
│   Upload    │     │   Concepts  │     │   Analyze   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    ▼
              ┌─────────────┐     ┌─────────────┐
              │   SCREEN 4  │◀───▶│   SCREEN 5  │
              │  Provenance │     │   Results   │
              └─────────────┘     └──────┬──────┘
                                         │
                                         ▼
                                   ┌─────────────┐
                                   │   SCREEN 6  │
                                   │   Explorer  │
                                   └─────────────┘
```

### A2. Drill Hierarchy

```
L0: Overview
 └── L1: Concept Detail
      └── L2: Sub-components
           └── L3: Technical Specs
                └── L4: Raw Source
```

### A3. Data Flow

```
[Source Files] 
     │
     ▼
[Extraction Engine] ──▶ [Concept Registry]
                              │
                              ▼
                       [Analysis Engine] ◀── [Web Search]
                              │
                              ▼
                       [Validity Scores]
                              │
                              ▼
                    [Visualization Engine]
                              │
                              ▼
                     [Asset Generator]
                              │
                              ▼
                      [Export System]
```

---

**END OF SPECIFICATION**

*Document Version: 1.0*  
*Specification Complete: Ready for Implementation*
