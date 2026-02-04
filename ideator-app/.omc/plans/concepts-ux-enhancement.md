# ConceptsScreen UX Enhancement Plan

## Context

### Original Request
Enhance the ConceptsScreen with a detail panel for concept inspection, smart sidebar navigation, pipeline status display, and collapsible sections.

### Interview Summary
| Decision | User Choice |
|----------|-------------|
| Card click behavior | Detail panel (side drawer) |
| Sidebar navigation | Contextual/smart links |
| Pipeline status | Standard display |
| Collapsibility | All sections collapsible |

### Clarifications (Critic Review)
| Decision | Resolution |
|----------|------------|
| Action button routes | `/analyze/:id`, `/explore/:id`, `/provenance/:id` |
| Always-visible nav links | Upload, Concepts, Results |
| Contextual nav links | Analyze, Explore, Provenance (only when concept selected) |
| Escape key closes panel | Yes |
| Panel animation | Slide-in from right (~300ms) |
| Focus management | Simple (focus panel on open, no trap) |
| FilterPanel.tsx cleanup | Keep for reference |

### Research Findings
- **ConceptsScreen** (`src/screens/concepts/ConceptsScreen.tsx`): Uses SplitPanel with FilterPanel sidebar. Pipeline state tracked. Card click NOT wired up currently.
- **ClusterContainer** (`src/screens/concepts/ClusterContainer.tsx`): Already has `onConceptClick` prop but ConceptsScreen doesn't pass it.
- **ConceptCard** (`src/screens/concepts/ConceptCard.tsx`): Has `onClick` prop, renders as button element.
- **ResultDetailPanel** (`src/screens/results/ResultDetailPanel.tsx`): Pattern to follow - overlay (z-50) + fixed panel (z-51, 600px wide).
- **FilterPanel** (`src/screens/concepts/FilterPanel.tsx`): Currently only renders filter accordions. Will be replaced by ConceptsSidebar.
- **Accordion** (`src/components/composites/Accordion.tsx`): Props: title, badge, defaultOpen, children, className.
- **Concept type** (`src/types/concept.ts`): Has parentConcepts, childConcepts, relatedConcepts, sourceReferences arrays.

---

## Work Objectives

### Core Objective
Transform the ConceptsScreen from a passive display into an interactive workspace where users can inspect concept details, navigate contextually, and monitor pipeline status.

### Deliverables
1. `ConceptDetailPanel.tsx` — Side drawer for concept inspection
2. `ConceptsSidebar.tsx` — Replaces FilterPanel with Navigation + Status + Filters
3. Updated `ConceptsScreen.tsx` — Wires everything together

### Definition of Done
- Clicking any concept card opens the detail panel
- Detail panel shows all concept metadata with action buttons
- Sidebar has 3 collapsible sections (Navigation, Status, Filters)
- Navigation links are contextually shown/hidden
- Pipeline status displays extraction metrics
- All sections can be independently collapsed/expanded
- No TypeScript errors, follows existing patterns

---

## Guardrails

### Must Have
- Follow ResultDetailPanel overlay/panel pattern exactly
- Use existing Accordion component for all collapsible sections
- Maintain existing filter functionality
- Use design system CSS variables (no hardcoded colors)
- Type-safe with Concept interface

### Must NOT Have
- Modal/dialog pattern (user explicitly chose side drawer)
- Always-visible navigation links (must be contextual)
- Inline editing of concepts (read-only display)
- New dependencies or libraries

---

## Task Flow

```
[Task 1: ConceptDetailPanel] ─────────────────────┐
                                                   │
[Task 2: ConceptsSidebar] ────────────────────────┼──► [Task 3: Wire up ConceptsScreen]
                                                   │
                                                   │
                                                  ─┘
```

Tasks 1 and 2 are independent (can be parallelized).
Task 3 depends on both Task 1 and Task 2.

---

## Detailed TODOs

### Task 1: Create ConceptDetailPanel Component

**File:** `src/screens/concepts/ConceptDetailPanel.tsx` (NEW)

**Purpose:** Side drawer panel that displays full concept details when a card is clicked.

**Props Interface:**
```typescript
interface ConceptDetailPanelProps {
  concept: Concept | null
  allConcepts: Concept[]  // For resolving related/parent/child by ID
  onClose: () => void
}
```

**Structure:**
```
<>
  {/* Overlay - click to close */}
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50 }} />

  {/* Panel */}
  <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '600px', maxWidth: '90vw', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)', zIndex: 51, overflowY: 'auto' }}>

    {/* Header: Name + Level Badge + Close Button */}
    {/* Domain + Themes as Tags */}
    {/* Description */}
    {/* Source References (collapsible) */}
    {/* Related Concepts (collapsible) */}
    {/* Parent Concepts (collapsible) */}
    {/* Child Concepts (collapsible) */}
    {/* Action Buttons: Analyze, Explore, View Provenance */}

  </div>
</>
```

**Sections to Include:**

1. **Header** (lines ~20-40)
   - Concept name (h2, font-bold)
   - Abstraction level Badge (cyan/green/magenta per level)
   - Close button (X, top-right)

2. **Metadata Block** (lines ~42-60)
   - Domain as Tag
   - Themes as Tags (all, not truncated like card)
   - Extraction timestamp

3. **Description** (lines ~62-75)
   - Full description text (not truncated)

4. **Source References** (lines ~77-110)
   - Accordion: "Source References" with count badge
   - List each SourceRef: fileName, location, excerpt
   - Style: left-border accent like ResultDetailPanel evidence

5. **Related Concepts** (lines ~112-140)
   - Accordion: "Related Concepts" with count badge
   - Resolve IDs to names using allConcepts prop
   - Clickable links that call onClose then navigate? OR just display names
   - Only render if relatedConcepts.length > 0

6. **Parent Concepts** (lines ~142-165)
   - Same pattern as Related
   - Only render if parentConcepts.length > 0

7. **Child Concepts** (lines ~167-190)
   - Same pattern as Related
   - Only render if childConcepts.length > 0

8. **Action Buttons** (lines ~192-220)
   - Sticky or at bottom
   - "Analyze" button → navigates to `/analyze/${concept.id}`
   - "Explore" button → navigates to `/explore/${concept.id}`
   - "View Provenance" button → navigates to `/provenance/${concept.id}`
   - Use `useNavigate` from react-router-dom

**Imports Needed:**
```typescript
import { useNavigate } from 'react-router-dom'
import type { Concept } from '@/types/concept.ts'
import Button from '@/components/ui/Button.tsx'
import Badge from '@/components/ui/Badge.tsx'
import Tag from '@/components/ui/Tag.tsx'
import Accordion from '@/components/composites/Accordion.tsx'
```

**Keyboard & Animation:**
- Add `useEffect` to listen for Escape key: `document.addEventListener('keydown', handleEscape)`
- Panel uses CSS transition: `transform 0.3s ease-out`
- Initial state: `translateX(100%)`, open state: `translateX(0)`
- Focus panel container on open via `useRef` + `useEffect`

**Acceptance Criteria:**
- [ ] Panel appears on right side with overlay backdrop
- [ ] Clicking overlay closes panel
- [ ] Close button (X) closes panel
- [ ] Escape key closes panel
- [ ] Panel slides in from right (~300ms animation)
- [ ] Panel receives focus on open
- [ ] All concept fields displayed
- [ ] Related/parent/child sections only show when data exists
- [ ] Action buttons navigate to correct routes (`/analyze/:id`, `/explore/:id`, `/provenance/:id`)
- [ ] Follows ResultDetailPanel styling patterns
- [ ] No TypeScript errors

---

### Task 2: Create ConceptsSidebar Component

**File:** `src/screens/concepts/ConceptsSidebar.tsx` (NEW)

**Purpose:** Replace FilterPanel with enhanced sidebar containing Navigation, Status, and Filters sections.

**Props Interface:**
```typescript
interface ConceptsSidebarProps {
  // Navigation context
  selectedConceptId: string | null  // For contextual Analyze/Explore/Provenance links

  // Pipeline status
  pipelineState: 'idle' | 'running' | 'done' | 'error'
  conceptCount: number
  domainCount: number
  extractionTime?: Date

  // Filter props (pass-through from existing FilterPanel)
  levelFilters: LevelFilterData[]
  selectedDomains: string[]
  selectedThemes: string[]
  selectedLevels: string[]
  onDomainsChange: (domains: string[]) => void
  onThemesChange: (themes: string[]) => void
  onLevelsChange: (levels: string[]) => void
  onClear: () => void
}
```

**Import for LevelFilterData:**
```typescript
import type { LevelFilterData } from './FilterPanel.tsx'
```

**Structure:**
```tsx
<aside className="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] p-5">

  {/* Section 1: Navigation */}
  <Accordion title="Navigation" defaultOpen={true}>
    <nav className="flex flex-col gap-2">
      {/* Always visible */}
      <NavLink to="/upload">Upload</NavLink>
      <NavLink to="/concepts">Concepts</NavLink>
      <NavLink to="/results">Results</NavLink>

      {/* Contextual: only if concept selected */}
      {selectedConceptId && (
        <>
          <NavLink to={`/analyze/${selectedConceptId}`}>Analyze</NavLink>
          <NavLink to={`/provenance/${selectedConceptId}`}>Provenance</NavLink>
          <NavLink to={`/explore/${selectedConceptId}`}>Explore</NavLink>
        </>
      )}
    </nav>
  </Accordion>

  {/* Section 2: Pipeline Status */}
  <Accordion title="Pipeline Status" badge={<StatusBadge state={pipelineState} />} defaultOpen={true}>
    <div className="flex flex-col gap-2 text-sm">
      <div>Status: {pipelineState}</div>
      <div>Concepts: {conceptCount}</div>
      <div>Domains: {domainCount}</div>
      {extractionTime && <div>Extracted: {extractionTime.toLocaleString()}</div>}
    </div>
  </Accordion>

  {/* Section 3: Filters (existing FilterPanel content) */}
  <Accordion title="Filters" badge={hasFilters ? <Badge>Active</Badge> : null} defaultOpen={true}>
    {/* Existing filter accordions moved here */}
  </Accordion>

</aside>
```

**Navigation Link Styling:**
```typescript
// Helper component for styled nav links
function SidebarNavLink({ to, children, active }: { to: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
      style={{
        color: active ? 'var(--color-cyan)' : 'var(--text-secondary)',
        background: active ? 'rgba(0, 229, 255, 0.08)' : undefined
      }}
    >
      {children}
    </Link>
  )
}
```

**Status Badge Logic:**
```typescript
function getStatusBadge(state: 'idle' | 'running' | 'done' | 'error') {
  switch (state) {
    case 'idle': return <Badge variant="gray">Idle</Badge>
    case 'running': return <Badge variant="cyan">Running</Badge>
    case 'done': return <Badge variant="green">Done</Badge>
    case 'error': return <Badge variant="orange">Error</Badge>
  }
}
```

**Imports Needed:**
```typescript
import { Link, useLocation } from 'react-router-dom'
import Accordion from '@/components/composites/Accordion.tsx'
import Checkbox from '@/components/ui/Checkbox.tsx'
import Button from '@/components/ui/Button.tsx'
import Badge from '@/components/ui/Badge.tsx'
import type { LevelFilterData } from './FilterPanel.tsx'  // Re-export or move type
```

**Acceptance Criteria:**
- [ ] Three collapsible sections: Navigation, Pipeline Status, Filters
- [ ] Each section uses Accordion component
- [ ] Navigation shows/hides links based on context
- [ ] Upload, Concepts, Results always visible
- [ ] Analyze/Provenance/Explore only visible when concept selected
- [ ] Pipeline status shows state, concept count, domain count, extraction time
- [ ] Filters section contains all existing filter functionality
- [ ] Clear filters button works
- [ ] No TypeScript errors

---

### Task 3: Wire Up ConceptsScreen

**File:** `src/screens/concepts/ConceptsScreen.tsx` (MODIFY)

**Changes Required:**

#### 3.1 Add State for Selected Concept (around line 28)
```typescript
// Existing state
const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
const [pipelineConcepts, setPipelineConcepts] = useState<Concept[] | null>(null)

// NEW: Selected concept for detail panel
const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)
```

#### 3.2 Add Derived Values for Sidebar (around line 85)
```typescript
// NEW: Compute values for sidebar
const domainCount = useMemo(() => {
  const domains = new Set(concepts.map(c => c.domain).filter(Boolean))
  return domains.size
}, [concepts])

const extractionTime = useMemo(() => {
  if (pipelineConcepts && pipelineConcepts.length > 0) {
    return pipelineConcepts[0].extractionTimestamp
  }
  return undefined
}, [pipelineConcepts])
```

#### 3.3 Add Click Handler (around line 112)
```typescript
// NEW: Handle concept card click
const handleConceptClick = (concept: Concept) => {
  setSelectedConcept(concept)
}

// NEW: Close detail panel
const handleCloseDetail = () => {
  setSelectedConcept(null)
}
```

#### 3.4 Replace FilterPanel with ConceptsSidebar (around line 148)
```typescript
// BEFORE:
<SplitPanel
  sidebar={
    <FilterPanel
      levelFilters={levelFilters}
      selectedDomains={selectedDomains}
      ...
    />
  }
>

// AFTER:
<SplitPanel
  sidebar={
    <ConceptsSidebar
      selectedConceptId={selectedConcept?.id ?? null}
      pipelineState={pipelineState}
      conceptCount={filtered.length}
      domainCount={domainCount}
      extractionTime={extractionTime}
      levelFilters={levelFilters}
      selectedDomains={selectedDomains}
      selectedThemes={selectedThemes}
      selectedLevels={selectedLevels}
      onDomainsChange={setSelectedDomains}
      onThemesChange={setSelectedThemes}
      onLevelsChange={setSelectedLevels}
      onClear={clearFilters}
    />
  }
>
```

#### 3.5 Pass Click Handler to ClusterContainer (around line 171)
```typescript
// BEFORE:
<ClusterContainer
  key={cluster.id}
  cluster={cluster}
  concepts={clusterConcepts}
/>

// AFTER:
<ClusterContainer
  key={cluster.id}
  cluster={cluster}
  concepts={clusterConcepts}
  onConceptClick={handleConceptClick}
/>
```

#### 3.6 Add ConceptDetailPanel (around line 180, before closing div)
```typescript
// NEW: Add detail panel at end of component
{selectedConcept && (
  <ConceptDetailPanel
    concept={selectedConcept}
    allConcepts={concepts}
    onClose={handleCloseDetail}
  />
)}
```

#### 3.7 Update Imports (top of file)
```typescript
// REMOVE:
import FilterPanel from './FilterPanel.tsx'

// ADD:
import ConceptsSidebar from './ConceptsSidebar.tsx'
import ConceptDetailPanel from './ConceptDetailPanel.tsx'
```

**Acceptance Criteria:**
- [ ] Clicking a ConceptCard opens ConceptDetailPanel
- [ ] ConceptDetailPanel shows correct concept data
- [ ] Closing panel clears selectedConcept state
- [ ] ConceptsSidebar receives all required props
- [ ] Sidebar navigation reflects selected concept
- [ ] Pipeline status displays in sidebar
- [ ] All existing filter functionality preserved
- [ ] No TypeScript errors

---

### Task 4: Clean Up (SKIP)

**File:** `src/screens/concepts/FilterPanel.tsx`

**Action:** Keep for reference and potential reuse. Do NOT delete.

**Note:** ConceptsScreen.tsx import of FilterPanel will be removed (replaced by ConceptsSidebar), but the file itself remains in the codebase.

---

## Commit Strategy

### Commit 1: Add ConceptDetailPanel
```
feat(concepts): add ConceptDetailPanel component

- Create side drawer panel for concept inspection
- Show full concept details with metadata
- Add action buttons for Analyze/Explore/Provenance
- Follow ResultDetailPanel overlay pattern
```

### Commit 2: Add ConceptsSidebar
```
feat(concepts): add ConceptsSidebar with smart navigation

- Replace FilterPanel with enhanced sidebar
- Add collapsible Navigation section with contextual links
- Add collapsible Pipeline Status section
- Preserve existing filter functionality in Filters section
```

### Commit 3: Wire up ConceptsScreen
```
feat(concepts): integrate detail panel and sidebar

- Add selectedConcept state management
- Wire up card click to open detail panel
- Connect ConceptsSidebar with pipeline state
- Enable contextual navigation based on selection
```

---

## Success Criteria

### Functional
- [ ] Clicking any concept card opens detail panel
- [ ] Detail panel displays all concept fields
- [ ] Detail panel has working action buttons
- [ ] Clicking overlay or X closes panel
- [ ] Sidebar has 3 independently collapsible sections
- [ ] Navigation links appear/disappear based on context
- [ ] Pipeline status shows current state and metrics
- [ ] All filters work as before

### Technical
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] Follows existing code patterns and design system
- [ ] Components are properly typed
- [ ] No console errors or warnings

### UX
- [ ] Panel slides in from right with CSS transition (~300ms ease-out)
- [ ] Escape key closes the panel
- [ ] Panel receives focus on open (simple focus, no trap)
