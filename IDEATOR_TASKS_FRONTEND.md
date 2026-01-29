# IDEATOR — Frontend Team Task List

**Sprint Planning Document**  
**Reference:** IDEATOR_SPECIFICATION.md

---

## Overview

The frontend team is responsible for all user interface implementation, including the design system, all 6 screens, interactive visualizations, PWA configuration, and responsive layouts.

**Primary Technologies:** React, TypeScript, TailwindCSS, D3.js (visualizations), Workbox (PWA)

---

## Task Categories

1. [Design System & Component Library](#1-design-system--component-library)
2. [PWA & Application Shell](#2-pwa--application-shell)
3. [Global Components](#3-global-components)
4. [Screen 1: Upload & Ingest](#4-screen-1-upload--ingest)
5. [Screen 2: Concept Population](#5-screen-2-concept-population)
6. [Screen 3: Analysis Trigger](#6-screen-3-analysis-trigger)
7. [Screen 4: Source-to-Asset Mapping](#7-screen-4-source-to-asset-mapping)
8. [Screen 5: All Results](#8-screen-5-all-results)
9. [Screen 6: Concept Explorer](#9-screen-6-concept-explorer)
10. [Central Viewer Component](#10-central-viewer-component)
11. [Visualization Components](#11-visualization-components)

---

## 1. Design System & Component Library

### FE-1.1: Design Tokens & Theme Configuration
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** None  
**Blocks:** All other frontend tasks

**Description:**  
Establish the design token system for the Tron-like wireframe aesthetic.

**Deliverables:**
- [x] Color palette CSS variables:
  ```css
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --grid-color: rgba(26, 26, 46, 0.15);
  --accent-nav: #00FFFF;      /* Cyan - navigation */
  --accent-warning: #FF6600;   /* Orange - warnings */
  --accent-success: #00FF88;   /* Green - validity */
  --accent-creative: #FF00FF;  /* Magenta - creativity */
  --accent-info: #4488FF;      /* Blue - information */
  --accent-neutral: #888899;   /* Gray - secondary */
  --text-primary: #FFFFFF;
  --text-secondary: #AAAACC;
  --glow-intensity: 0.6;
  ```
- [x] Typography scale (monospace/geometric sans):
  - Font family: JetBrains Mono (code), Rajdhani (headings), Inter (body fallback)
  - Size scale: 12/14/16/20/24/32/48px
- [x] Spacing scale: 4/8/12/16/24/32/48/64px
- [x] Border radius: 0 (sharp), 2px (subtle), 4px (cards)
- [x] Shadow/glow definitions for each accent color
- [x] Z-index scale for layering

**Acceptance Criteria:**
- All tokens exported as CSS custom properties
- TailwindCSS config extended with custom values
- Dark mode only (no light mode toggle needed)

---

### FE-1.2: Base Component Library — Primitives
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 4 days  
**Dependencies:** FE-1.1  
**Blocks:** All screen implementations

**Description:**  
Build foundational UI primitives matching the design aesthetic.

**Deliverables:**
- [x] **Button** — variants: primary (cyan glow), secondary (outline), danger (orange), creative (magenta)
  - States: default, hover (glow intensify), active (scale 98%), disabled, loading
- [x] **Input** — text input with wireframe border, glow on focus
- [x] **TextArea** — multi-line input
- [x] **Select/Dropdown** — custom styled dropdown
- [x] **Checkbox** — wireframe style with glow check
- [ ] **Radio** — wireframe style
- [x] **Toggle** — on/off switch
- [x] **Badge** — small label (for abstraction level, tier)
- [x] **Tag** — removable tag (for themes)
- [x] **Tooltip** — hover info display
- [ ] **Icon** — icon wrapper with consistent sizing

**Acceptance Criteria:**
- All components match Tron aesthetic
- Keyboard accessible
- TypeScript props fully typed
- Storybook stories for each variant/state

---

### FE-1.3: Base Component Library — Composite
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 4 days  
**Dependencies:** FE-1.2  
**Blocks:** All screen implementations

**Description:**  
Build composite UI components.

**Deliverables:**
- [x] **Card** — wireframe bordered container with optional glow
- [x] **Modal** — overlay dialog with backdrop blur
- [x] **Toast** — notification popup (success/info/warning/error colors)
- [x] **Progress Bar** — segmented with phase labels, animated fill
- [x] **Skeleton** — loading placeholder with wireframe shimmer
- [x] **Accordion** — collapsible section (for clusters)
- [x] **Tabs** — tab switcher
- [x] **Breadcrumb** — navigation trail with separators
- [x] **SearchInput** — input with search icon, clear button
- [x] **FilterDropdown** — multi-select filter with checkboxes
- [x] **EmptyState** — illustrated empty state with CTA
- [x] **ErrorState** — error display with retry button

**Acceptance Criteria:**
- Components composable and reusable
- Animations use `prefers-reduced-motion` check
- All interactive elements keyboard navigable

---

### FE-1.4: Animation & Micro-interaction System
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-1.2, FE-1.3  
**Blocks:** Screen polish

**Description:**  
Define and implement subtle micro-interactions.

**Deliverables:**
- [x] Hover state animations (glow intensify, 150ms ease)
- [x] Button press animation (scale 98% + pulse, 100ms)
- [x] Page/screen transitions (fade + slide, 200ms ease-out)
- [ ] List item stagger animation (50ms delay per item)
- [x] Loading spinner (pulsing glow)
- [x] Toast slide-in animation
- [x] Skeleton shimmer animation
- [x] Respect `prefers-reduced-motion` — disable all but essential

**Acceptance Criteria:**
- Animations are subtle, not distracting
- All durations match spec (150ms, 200ms, etc.)
- Reduced motion mode functional

---

## 2. PWA & Application Shell

### FE-2.1: PWA Configuration
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** None  
**Blocks:** Offline functionality

**Description:**  
Configure Progressive Web App capabilities.

**Deliverables:**
- [ ] Web App Manifest (`manifest.json`):
  - Name: "IDEATOR"
  - Short name: "IDEATOR"
  - Theme color: #0a0a0f
  - Background color: #0a0a0f
  - Display: standalone
  - Icons: 192x192, 512x512 (wireframe logo)
- [ ] Service Worker setup (Workbox)
- [ ] Install prompt handling
- [ ] App shell caching strategy

**Acceptance Criteria:**
- Installable on desktop and mobile
- Passes Lighthouse PWA audit
- Launches in standalone window

---

### FE-2.2: Offline Mode & Caching
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-2.1, BE-1.3 (storage service)  
**Blocks:** None

**Description:**  
Implement offline viewing and upload queuing.

**Deliverables:**
- [ ] Cache strategy:
  - App shell: cache-first
  - API responses: network-first with cache fallback
  - Static assets: cache-first with background update
- [ ] Offline detection (navigator.onLine + fetch failures)
- [ ] Offline indicator UI (banner or icon)
- [ ] Upload queue persistence (via Backend storage service)
- [ ] Graceful degradation messaging

**Acceptance Criteria:**
- Cached data viewable offline
- Clear messaging when features unavailable
- Uploads queue and sync on reconnect

---

### FE-2.3: Application Shell & Layout
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-1.1  
**Blocks:** All screens

**Description:**  
Implement the persistent application shell.

**Deliverables:**
- [x] Root layout with:
  - Perspective grid background (CSS)
  - Top navigation bar slot
  - Main content area
  - Toast container
- [x] Responsive breakpoints:
  - Desktop: ≥1024px (full layout)
  - Tablet: 768-1023px (adapted layout)
  - Mobile: <768px (unsupported message)
- [x] Mobile block screen ("Please use a desktop or tablet device")

**Acceptance Criteria:**
- Grid background renders correctly
- Layout adapts at breakpoints
- Mobile users see friendly message

---

## 3. Global Components

### FE-3.1: Top Navigation Bar
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-1.2, FE-1.3  
**Blocks:** All screens

**Description:**  
Implement persistent top navigation.

**Deliverables:**
- [x] Logo/wordmark (click → concepts or upload if empty)
- [x] Global search trigger (opens modal, Cmd/Ctrl+K shortcut)
- [x] Settings button (opens settings modal)
- [ ] Help button (opens help overlay)
- [ ] Offline indicator (when disconnected)
- [x] Responsive collapse for tablet

**Acceptance Criteria:**
- Logo navigation works correctly
- Keyboard shortcut functional
- Responsive adaptation clean

---

### FE-3.2: Global Search Modal
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-1.3, BE-8.1 (search engine)  
**Blocks:** None

**Description:**  
Implement global search overlay.

**Deliverables:**
- [x] Modal with search input (auto-focus on open)
- [x] Real-time results as user types (debounced 200ms)
- [x] Result categories (Concepts, Analyses, Assets)
- [x] Keyboard navigation (up/down arrows, Enter to select)
- [x] Result item: name, type badge, snippet with highlight
- [x] Click/Enter → navigate to item
- [x] Escape to close

**Acceptance Criteria:**
- Results appear within 500ms
- Keyboard navigation fully functional
- Search highlighting accurate

---

### FE-3.3: Settings Modal
**Priority:** P2 (Medium)  
**Estimated Effort:** 1 day  
**Dependencies:** FE-1.3  
**Blocks:** None

**Description:**  
Implement settings modal.

**Deliverables:**
- [x] Sections:
  - Data: "Clear All Data" button with confirmation
  - Export: "Export Generated Assets" button
  - About: Version number, credits
- [x] Confirmation dialog for destructive actions

**Acceptance Criteria:**
- Clear data requires double confirmation
- Export triggers ZIP download
- Version displayed correctly

---

### FE-3.4: Toast Notification System
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 1 day  
**Dependencies:** FE-1.3  
**Blocks:** Error handling across app

**Description:**  
Implement toast notification manager.

**Deliverables:**
- [x] Toast container (bottom-right positioning)
- [x] Toast types with colors:
  - Success (green, 3s auto-dismiss)
  - Info (cyan, 4s auto-dismiss)
  - Warning (orange, 5s auto-dismiss)
  - Error (red, persistent until dismissed)
- [x] Stacking behavior (max 3 visible)
- [x] Manual dismiss button
- [x] Toast API: `toast.success()`, `toast.error()`, etc.

**Acceptance Criteria:**
- Toasts stack correctly
- Auto-dismiss timing accurate
- Dismiss animation smooth

---

### FE-3.5: Loading States
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-1.3  
**Blocks:** None

**Description:**  
Implement consistent loading patterns.

**Deliverables:**
- [ ] Full-page loader (grid animation)
- [ ] Section skeleton screens per screen type
- [ ] Inline button spinner
- [ ] Progress overlay for long operations

**Acceptance Criteria:**
- Loading states prevent interaction
- Skeletons match actual content layout
- Animations smooth at 60fps

---

## 4. Screen 1: Upload & Ingest

### FE-4.1: Upload Screen Layout
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-2.3, FE-3.1  
**Blocks:** FE-4.2, FE-4.3

**Description:**  
Implement Screen 1 layout structure.

**Deliverables:**
- [x] Page layout per wireframe spec
- [x] Route: `/upload`
- [x] Navigation from logo when no data exists

**Acceptance Criteria:**
- Layout matches specification wireframe
- Responsive at tablet breakpoint

---

### FE-4.2: Drag-and-Drop Upload Zone
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-4.1, FE-1.2  
**Blocks:** Integration with Backend

**Description:**  
Implement file upload interface.

**Deliverables:**
- [x] Drop zone with dashed wireframe border
- [x] Drag states: default, dragover (cyan glow), invalid (orange)
- [x] Click to open file picker
- [x] Multi-file selection
- [x] Format validation on drop:
  - Supported: add to queue
  - Unsupported: toast error with format name
- [ ] File type icons (document, video, audio, image, data)

**Acceptance Criteria:**
- Drag-and-drop works across browsers
- Invalid formats rejected with feedback
- Multiple files handled correctly

---

### FE-4.3: Google Drive Folder Linker
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-4.1, NET-3.1 (Google OAuth)  
**Blocks:** None

**Description:**  
Implement Google Drive folder selection.

**Deliverables:**
- [ ] "Link Google Drive Folder" button
- [ ] OAuth popup flow handling
- [ ] Google Picker integration for folder selection
- [ ] Display selected folder name + file count
- [ ] Loading state during folder scan

**Acceptance Criteria:**
- OAuth flow completes successfully
- Folder contents enumerated
- User can change selection before ingestion

---

### FE-4.4: Upload Queue Display
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-4.2, FE-4.3  
**Blocks:** None

**Description:**  
Implement upload queue list.

**Deliverables:**
- [x] Queue list with items:
  - File icon (by type)
  - Filename (truncate with ellipsis)
  - File size (formatted: KB/MB/GB)
  - Remove button (×)
- [x] Running totals: file count, total size
- [x] "Clear All" button
- [x] Collapsed state when empty
- [x] Expanded state when files present

**Acceptance Criteria:**
- Items removable individually
- Totals update in real-time
- Handles 100+ files performantly

---

### FE-4.5: Ingestion Trigger & Progress
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-4.4, BE-2.5 (processing orchestrator)  
**Blocks:** Navigation to Screen 2

**Description:**  
Implement ingestion initiation and progress display.

**Deliverables:**
- [x] "Begin Ingestion" button:
  - Disabled when queue empty
  - Enabled with glow when files present
- [x] Processing overlay:
  - File-by-file progress
  - Current file name
  - Overall percentage
  - Phase indicator
- [x] Error handling:
  - Individual file failures shown
  - Option to continue with successful files
- [x] Auto-navigate to Screen 2 on completion

**Acceptance Criteria:**
- Progress updates smoothly
- Partial failures handled gracefully
- Navigation occurs automatically on success

---

## 5. Screen 2: Concept Population

### FE-5.1: Concepts Screen Layout
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-2.3, FE-3.1  
**Blocks:** FE-5.2, FE-5.3

**Description:**  
Implement Screen 2 layout structure.

**Deliverables:**
- [x] Page layout per wireframe spec
- [x] Route: `/concepts`
- [x] Header with search, filters, concept count, "+ New" button

**Acceptance Criteria:**
- Layout matches specification wireframe
- Responsive at tablet breakpoint

---

### FE-5.2: Cluster Container Component
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-5.1, FE-1.3, BE-3.3 (clustering)  
**Blocks:** None

**Description:**  
Implement collapsible concept clusters.

**Deliverables:**
- [x] Cluster header:
  - Domain/theme name
  - Concept count badge
  - Collapse/expand toggle
- [x] Horizontal scrollable concept row
- [ ] "+N more" indicator for overflow
- [x] Collapsed state (header only)
- [x] Expanded state (shows cards)
- [ ] Staggered load animation for cards

**Acceptance Criteria:**
- Clusters collapse/expand smoothly
- Horizontal scroll works on tablet
- Performance OK with 20+ clusters

---

### FE-5.3: Concept Card Component
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-1.3, BE-1.2 (data models)  
**Blocks:** None

**Description:**  
Implement concept preview card.

**Deliverables:**
- [x] Fixed size: 180×220px
- [x] Content:
  - Concept name (max 2 lines, ellipsis)
  - Description (max 2 lines, ellipsis)
  - Abstraction level badge (L1/L2/L3)
  - Source count indicator
- [x] Hover state: subtle glow, reveal "Analyze →" button
- [x] Click: navigate to Screen 3

**Acceptance Criteria:**
- Card content truncates gracefully
- Hover interaction smooth
- Click navigation works

---

### FE-5.4: Filter Panel
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-1.3, BE-8.2 (filter engine)  
**Blocks:** None

**Description:**  
Implement filter controls.

**Deliverables:**
- [x] Filter dropdown trigger button
- [ ] Filter panel with:
  - Abstraction level (checkboxes: L1, L2, L3)
  - Domain (multi-select dropdown)
  - Date ingested (date range picker)
  - Source file (multi-select dropdown)
- [ ] Active filter count badge
- [x] "Clear Filters" button
- [x] Instant application (no "Apply" button needed)

**Acceptance Criteria:**
- Filters apply immediately
- Multiple filters combine correctly
- Clear resets all filters

---

## 6. Screen 3: Analysis Trigger

### FE-6.1: Analysis Screen Layout
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-2.3, FE-3.1  
**Blocks:** FE-6.2, FE-6.3

**Description:**  
Implement Screen 3 layout structure.

**Deliverables:**
- [x] Page layout per wireframe spec
- [x] Route: `/analyze/:conceptId`
- [x] Back navigation to concepts

**Acceptance Criteria:**
- Layout matches specification wireframe
- Dynamic route parameter handled

---

### FE-6.2: Concept Detail Card
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-6.1, BE-1.2  
**Blocks:** None

**Description:**  
Implement full concept detail display.

**Deliverables:**
- [x] Concept name (large heading)
- [x] Description (full text)
- [x] Metadata: abstraction level, domain, themes (as tags)
- [x] Source references list:
  - Filename
  - Location (page, timestamp, slide)
  - Clickable → opens source preview overlay
- [x] Related concepts links (if any)

**Acceptance Criteria:**
- All concept data displayed
- Source links functional
- Related concepts navigate correctly

---

### FE-6.3: Analysis Trigger Button & Queue
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-6.1, BE-7.1, BE-7.2  
**Blocks:** None

**Description:**  
Implement analysis initiation and queue display.

**Deliverables:**
- [x] "Run Market Analysis" button:
  - Prominent with magenta glow
  - Disabled if already queued/analyzed
  - Click → adds to queue
- [x] Analysis queue panel:
  - List of queued/in-progress jobs
  - Active job: progress bar with phase label
  - Queued jobs: "Queued" status
  - Completed jobs: checkmark, clickable → Screen 5
  - Cancel button for queued (not active) jobs
- [x] Progress phases (from spec):
  1. "Searching market trends..."
  2. "Analyzing technical feasibility..."
  3. "Evaluating investment potential..."
  4. "Generating visualizations..."
  5. "Compiling report..."

**Acceptance Criteria:**
- Button state reflects concept status
- Progress bar updates in real-time
- Queue reflects actual backend state

---

## 7. Screen 4: Source-to-Asset Mapping

### FE-7.1: Provenance Screen Layout
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-2.3, FE-3.1  
**Blocks:** FE-7.2, FE-7.3

**Description:**  
Implement Screen 4 layout structure.

**Deliverables:**
- [x] Page layout per wireframe spec (split panel)
- [x] Route: `/provenance/:conceptId`
- [x] Back navigation

**Acceptance Criteria:**
- Split panel layout renders correctly
- Responsive adaptation for tablet

---

### FE-7.2: Source Panel
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-7.1, BE-6.3 (provenance tracker)  
**Blocks:** None

**Description:**  
Implement source material panel.

**Deliverables:**
- [x] Grouped by source file (collapsible)
- [ ] Source excerpts:
  - Text excerpts with highlighting
  - Audio/video clips with inline playback controls
  - Page/timestamp indicators
- [x] Click excerpt → expand with more context
- [x] Hover → highlight connected claims

**Acceptance Criteria:**
- Excerpts display correctly
- Media playback functional
- Hover highlighting works

---

### FE-7.3: Claims Panel with Connection Lines
**Priority:** P1 (High)  
**Estimated Effort:** 4 days  
**Dependencies:** FE-7.1, FE-7.2  
**Blocks:** None

**Description:**  
Implement claims panel with visual connections.

**Deliverables:**
- [x] List of generated claims
- [x] Confidence indicator per claim (color/opacity)
- [ ] Connection lines (SVG overlay):
  - Source excerpt ↔ claim linkage
  - Animated on hover
  - Color-coded by confidence
- [x] Click claim → highlight all supporting sources
- [x] Bidirectional highlighting

**Acceptance Criteria:**
- Lines render correctly across panels
- Hover animations smooth
- Highlighting is bidirectional

---

### FE-7.4: Asset Generation Modal
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-1.3, BE-6.1, BE-6.2  
**Blocks:** None

**Description:**  
Implement asset generation interface.

**Deliverables:**
- [x] Modal triggered by "Generate Assets" button
- [x] Asset type selector:
  - Documents: Executive Summary, Pitch Deck, One-Pager, Technical Brief, Market Report, Whitepaper
  - Visuals: Infographic, Concept Diagram, Timeline, Comparison Chart, Data Viz
- [x] Generate button per type
- [ ] Generation progress indicator
- [ ] Preview on completion
- [ ] Download button

**Acceptance Criteria:**
- All asset types selectable
- Generation triggers correctly
- Download produces valid file

---

## 8. Screen 5: All Results

### FE-8.1: Results Screen Layout
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-2.3, FE-3.1  
**Blocks:** FE-8.2, FE-8.3

**Description:**  
Implement Screen 5 layout structure.

**Deliverables:**
- [x] Page layout per wireframe spec
- [x] Route: `/results`
- [x] Header with search, filters, sort, export

**Acceptance Criteria:**
- Layout matches specification wireframe
- Sort controls functional

---

### FE-8.2: Tier Accordion Sections
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-8.1, FE-1.3  
**Blocks:** None

**Description:**  
Implement validity tier groupings.

**Deliverables:**
- [x] Four tier sections:
  - T1: High Potential (green header glow)
  - T2: Moderate Potential (yellow header glow)
  - T3: Low Potential (orange header glow)
  - T4: Not Viable (red header glow)
- [x] Collapsible accordion behavior
- [x] Count badge per tier
- [x] Default: T1 expanded, others collapsed

**Acceptance Criteria:**
- Tiers color-coded correctly
- Accordion expand/collapse works
- Counts accurate

---

### FE-8.3: Result Card Component
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-1.3, BE-4.3  
**Blocks:** None

**Description:**  
Implement analysis result card.

**Deliverables:**
- [x] Card content:
  - Concept name
  - Domain badge
  - Score bar visualization (0-100 fill)
  - One-line summary excerpt
- [x] Quick action buttons:
  - "View Details" → slide-out panel
  - "Generate Assets" → asset modal
  - "Explore" → navigate to Screen 6
- [x] Hover: subtle elevation

**Acceptance Criteria:**
- Score bar fills proportionally
- All actions functional
- Cards performant with 100+ results

---

### FE-8.4: Result Detail Slide-Out Panel
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-8.3  
**Blocks:** None

**Description:**  
Implement full report view in slide-out.

**Deliverables:**
- [x] Slide-out panel (right side, 50% width)
- [x] Full qualitative report content:
  - Executive summary
  - Market viability section + sub-scores
  - Technical feasibility section + sub-scores
  - Investment potential section + sub-scores
  - Key risks
  - Recommended next steps
  - Evidence citations (clickable)
- [x] Close button (× or click outside)

**Acceptance Criteria:**
- Panel slides smoothly
- Full report renders correctly
- Citations link to sources

---

### FE-8.5: Export Functionality
**Priority:** P2 (Medium)  
**Estimated Effort:** 2 days  
**Dependencies:** BE-6.1, BE-6.2  
**Blocks:** None

**Description:**  
Implement asset export feature.

**Deliverables:**
- [ ] Export button in header
- [ ] Export options modal:
  - Select specific concepts (checkboxes)
  - Select asset types to include
  - "Export All" option
- [ ] ZIP generation with folder structure:
  - `/documents/`
  - `/visuals/`
  - `manifest.json`
- [ ] Download trigger

**Acceptance Criteria:**
- ZIP contains correct files
- Manifest JSON accurate
- Large exports don't freeze UI

---

## 9. Screen 6: Concept Explorer

### FE-9.1: Explorer Screen Layout
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-2.3, FE-3.1  
**Blocks:** FE-9.2, FE-10.x, FE-11.x

**Description:**  
Implement Screen 6 layout structure.

**Deliverables:**
- [x] Page layout per wireframe spec (canvas + panel + strip)
- [x] Route: `/explore/:conceptId`
- [x] Breadcrumb navigation for drill levels

**Acceptance Criteria:**
- Three-zone layout renders correctly
- Breadcrumbs update with drill level

---

### FE-9.2: Drill Level Navigation
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-9.1, FE-1.3  
**Blocks:** None

**Description:**  
Implement 4+ level drill navigation.

**Deliverables:**
- [x] Breadcrumb trail: L0 > L1 > L2 > L3 > L4
- [x] Each level clickable to jump back
- [x] Current level highlighted
- [ ] "Drill Down" button (label changes by context):
  - L0→L1: "View Details"
  - L1→L2: "View Components"
  - L2→L3: "Technical Specs"
  - L3→L4: "View Source"
- [x] Disabled at deepest available level
- [x] Back button (also Escape key)
- [x] Level badge indicator (L0/L1/L2/L3/L4)

**Acceptance Criteria:**
- Navigation between all levels works
- Breadcrumb updates correctly
- Keyboard navigation functional

---

### FE-9.3: Detail Panel (Context-Sensitive)
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-9.1, FE-9.2  
**Blocks:** None

**Description:**  
Implement right-side detail panel that adapts to drill level.

**Deliverables:**
- [ ] Panel content by level:
  - L0: Cluster statistics
  - L1: Full report summary, validity scores
  - L2: Component details, relationships
  - L3: Technical data (adaptive depth)
  - L4: Source excerpt with full context
- [x] Selected node information (from visualization)
- [x] Related items links
- [x] "Drill Down" button integration

**Acceptance Criteria:**
- Panel updates on level change
- Panel updates on node selection
- Content appropriate to level

---

### FE-9.4: Source Excerpts Strip
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-9.1  
**Blocks:** None

**Description:**  
Implement bottom source excerpts display.

**Deliverables:**
- [x] Horizontally scrollable strip
- [x] Excerpt cards for current selection
- [x] Click card → drill to L4 (source view)
- [x] Empty state when no sources for selection

**Acceptance Criteria:**
- Scroll works smoothly
- Cards clickable
- Updates on selection change

---

## 10. Central Viewer Component

### FE-10.1: Unified Canvas Container
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** FE-9.1  
**Blocks:** FE-11.x

**Description:**  
Implement the central viewer canvas that hosts visualizations.

**Deliverables:**
- [x] Canvas container with:
  - Primary panel (visualization)
  - Secondary panel (contextual info)
  - Tertiary strip (metadata/actions)
- [x] View toggle: Tree | Map
- [x] Zoom controls (+/−/reset)
- [ ] Fullscreen toggle
- [x] Canvas background (subtle grid)

**Acceptance Criteria:**
- Panels laid out correctly
- Toggle switches visualization
- Zoom controls functional

---

### FE-10.2: Media-Reactive Display
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-10.1  
**Blocks:** None

**Description:**  
Make viewer panels adapt to content type.

**Deliverables:**
- [ ] Content type detection
- [ ] Panel configuration by type:
  - Concept Overview: summary + related list
  - Visualization: canvas + node detail
  - Analysis Report: scrollable text + citations
  - Source Material: document viewer + concepts sidebar
  - Generated Asset: preview + provenance
- [x] Smooth transition between configurations

**Acceptance Criteria:**
- Correct layout for each content type
- Transitions don't cause layout shift

---

## 11. Visualization Components

### FE-11.1: Branching Tree Visualization
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 5 days  
**Dependencies:** FE-10.1, BE-5.1 (timeline data)  
**Blocks:** None

**Description:**  
Implement the branching tree/graph visualization using D3.js.

**Deliverables:**
- [x] Tree layout algorithm (horizontal timeline)
- [x] Node rendering:
  - Size by significance score
  - Color by domain
  - Shape by node type (origin, variation, merge, current, projected)
  - Projected nodes: dashed outline
- [x] Edge rendering:
  - Solid for confirmed relationships
  - Dashed for inferred/predicted
  - Thickness by strength
- [x] Interactions:
  - Zoom (scroll wheel, pinch)
  - Pan (drag canvas)
  - Node click → select
  - Node hover → tooltip
  - Branch collapse/expand
- [ ] Timeline axis at bottom

**Acceptance Criteria:**
- Tree renders without overlap
- Interactions smooth at 60fps
- Handles 200+ nodes
- Zoom/pan bounded appropriately

---

### FE-11.2: Interactive Node Map Visualization
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 5 days  
**Dependencies:** FE-10.1, BE-5.2 (node map data)  
**Blocks:** None

**Description:**  
Implement the interactive node map using D3.js force simulation.

**Deliverables:**
- [x] Force-directed layout
- [x] Multi-type nodes:
  - Concept: hexagon, cyan
  - Patent: shield, magenta
  - Publication: document, green
  - Person: circle, orange
  - Company: square, yellow
  - Event: diamond, white
- [ ] Edge rendering by relationship type:
  - Created: solid arrow
  - Referenced: dotted
  - Funded: dashed
  - Employed: thin solid
  - Competed: red dashed
- [x] Interactions:
  - Zoom/pan
  - Click node → center + expand connections
  - Double-click → drill down
  - Right-click → context menu
  - Drag nodes to reposition
- [ ] Filtering:
  - By node type (toggles)
  - By date range
  - By relationship type
- [ ] Search within map (highlight matches)

**Acceptance Criteria:**
- Force simulation stabilizes quickly
- Node types visually distinct
- All interactions functional
- Filtering updates in real-time

---

### FE-11.3: Visualization Shared Utilities
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** FE-11.1, FE-11.2  
**Blocks:** None

**Description:**  
Extract shared utilities for both visualizations.

**Deliverables:**
- [x] Tooltip component (shared)
- [ ] Context menu component (shared)
- [x] Zoom/pan controls (shared)
- [x] Color scale utilities
- [ ] Export to image (PNG/SVG)
- [ ] Minimap (optional, if canvas is large)

**Acceptance Criteria:**
- Utilities work with both visualizations
- Export produces clean images

---

## Dependency Graph

```
FE-1.1 ──▶ FE-1.2 ──▶ FE-1.3 ──▶ FE-1.4
   │          │          │
   │          │          └───────────────────┐
   │          │                              │
   │          └──────────────────┬───────────┼──────────────────┐
   │                             │           │                  │
   ▼                             ▼           ▼                  ▼
FE-2.3 ────────────────────▶ FE-3.1 ──▶ FE-3.2     FE-3.3, FE-3.4, FE-3.5
   │                             │
   │                             │
   ├──▶ FE-4.1 ──▶ FE-4.2 ──▶ FE-4.4 ──▶ FE-4.5
   │         └──▶ FE-4.3
   │
   ├──▶ FE-5.1 ──▶ FE-5.2, FE-5.3, FE-5.4
   │
   ├──▶ FE-6.1 ──▶ FE-6.2, FE-6.3
   │
   ├──▶ FE-7.1 ──▶ FE-7.2 ──▶ FE-7.3 ──▶ FE-7.4
   │
   ├──▶ FE-8.1 ──▶ FE-8.2 ──▶ FE-8.3 ──▶ FE-8.4, FE-8.5
   │
   └──▶ FE-9.1 ──▶ FE-9.2 ──▶ FE-9.3, FE-9.4
              │
              └──▶ FE-10.1 ──▶ FE-10.2
                      │
                      └──▶ FE-11.1, FE-11.2 ──▶ FE-11.3

FE-2.1 ──▶ FE-2.2 (parallel track)

External Dependencies (from Backend team):
- FE-4.5 requires BE-2.5 (processing orchestrator)
- FE-5.2 requires BE-3.3 (clustering)
- FE-5.4 requires BE-8.2 (filter engine)
- FE-6.3 requires BE-7.1, BE-7.2 (queue system)
- FE-7.2, FE-7.3 require BE-6.3 (provenance tracker)
- FE-8.3 requires BE-4.3 (validity scorer)
- FE-11.1 requires BE-5.1 (timeline data)
- FE-11.2 requires BE-5.2 (node map data)

External Dependencies (from Network team):
- FE-4.3 requires NET-3.1 (Google OAuth)
- FE-3.2 requires BE-8.1 which requires NET-1.1 indirectly
```

---

## Sprint Recommendations

### Sprint 1 (Design System & Shell)
- FE-1.1, FE-1.2, FE-1.3, FE-1.4
- FE-2.1, FE-2.3
- FE-3.1, FE-3.4

### Sprint 2 (Upload & Concepts)
- FE-4.1, FE-4.2, FE-4.3, FE-4.4, FE-4.5
- FE-5.1, FE-5.2, FE-5.3, FE-5.4
- FE-2.2

### Sprint 3 (Analysis & Results)
- FE-6.1, FE-6.2, FE-6.3
- FE-8.1, FE-8.2, FE-8.3, FE-8.4

### Sprint 4 (Provenance & Explorer)
- FE-7.1, FE-7.2, FE-7.3, FE-7.4
- FE-9.1, FE-9.2, FE-9.3, FE-9.4
- FE-10.1, FE-10.2

### Sprint 5 (Visualizations & Polish)
- FE-11.1, FE-11.2, FE-11.3
- FE-3.2, FE-3.3, FE-3.5
- FE-8.5
- Bug fixes, accessibility audit

---

## Notes for Frontend Team

1. **Design system first** — Do not start screens until FE-1.x complete
2. **Storybook is mandatory** — Every component needs stories
3. **Performance matters** — Test with 100+ concepts, 20+ clusters
4. **D3.js visualizations are complex** — Allocate senior engineers
5. **Coordinate with Backend** — Data models must match interfaces exactly
6. **Accessibility from day one** — Don't bolt on later
7. **Test on tablet** — 768px breakpoint is real requirement

---

**END OF FRONTEND TASK LIST**
