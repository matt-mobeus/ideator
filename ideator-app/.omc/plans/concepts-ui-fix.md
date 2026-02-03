# Plan: Fix Concepts Screen UI/UX Issues

## Context

**Original Request:** Fix the Ideator Concepts screen where real LLM results fail to display properly while mock data works fine.

**Root Causes:** 5 verified bugs — empty clusters array kills rendering, un-normalized LLM domain strings, missing themes/abstraction defaults, no clustering wiring, flat filter hierarchy.

**Constraints:** Minimal changes, keep existing component structure, maintain design system tokens.

## Work Objectives

**Core Objective:** Make the Concepts screen render and filter real LLM-extracted concepts correctly.

**Deliverables:**
1. Concepts render with or without clusters
2. Domains normalized from comma-separated strings to individual values
3. Themes and abstraction levels validated with defaults
4. Filter panel restructured as L1/L2/L3 accordion groups with per-level toggle
5. Auto-clustering by abstraction level when no cluster data exists

**Definition of Done:** Real pipeline concepts display in grouped cards with working L1/L2/L3 filters. Zero regressions with mock data.

## Must Have
- Concepts visible when `pipelineConcepts` is truthy
- Domain filters show individual domains, not comma-joined strings
- L1/L2/L3 filter grouping via Accordion with level-toggle checkboxes
- Rendering uses `cluster.conceptIds.includes(c.id)` (NOT `c.clusterId === cluster.id`)
- Normalization at both extraction service AND display boundary

## Must NOT Have
- Full clustering pipeline integration (out of scope — just auto-group by abstraction level)
- Redesign of ConceptCard or ClusterContainer internals
- Changes to the LLM prompt (normalize on the receiving end)
- New dependencies
- Dead-code fallback for empty clusters (auto-clustering guarantees non-empty)

---

## Task Flow

```
T1 (normalize) → T2 (rendering fix) → T3 (filter restructure) → T4 (verify)
```

T1 has no dependencies. T2 depends on T1 output shape. T3 depends on T2 rendering working. T4 verifies all.

---

## TODO 1: Normalize LLM concept data at extraction boundary AND display boundary

**Files:**
- `src/services/concept-extraction.service.ts` — add normalization after raw concept mapping
- `src/screens/concepts/ConceptsScreen.tsx` — add display-time normalization at line 38

**Changes:**

### 1a. Create `normalizeConcept()` utility

In `src/services/concept-extraction.service.ts`, add:

```typescript
function normalizeConcept(concept: Concept): Concept {
  // Split comma-separated domain, take first value
  const domain = (concept.domain || 'General')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)[0] || 'General'

  // Validate abstraction level
  const validLevels = ['L1_SPECIFIC', 'L2_APPROACH', 'L3_PARADIGM'] as const
  const abstractionLevel = validLevels.includes(concept.abstractionLevel as any)
    ? concept.abstractionLevel
    : 'L2_APPROACH'

  // Ensure themes is always a non-empty string[]
  let themes: string[]
  if (Array.isArray(concept.themes) && concept.themes.length > 0) {
    themes = concept.themes.map((t) => t.trim()).filter(Boolean)
  } else if (typeof concept.themes === 'string' && concept.themes) {
    themes = (concept.themes as string).split(',').map((t) => t.trim()).filter(Boolean)
  } else {
    themes = ['General']
  }
  if (themes.length === 0) themes = ['General']

  return { ...concept, domain, abstractionLevel, themes }
}
```

Apply `normalizeConcept()` to every concept before returning from the extraction service.

### 1b. Display-time normalization in ConceptsScreen

At `src/screens/concepts/ConceptsScreen.tsx` line 38, where `setPipelineConcepts(conceptTask.output.concepts)` is called, wrap with normalization:

```typescript
setPipelineConcepts(conceptTask.output.concepts.map(normalizeConcept))
```

Import or inline `normalizeConcept` in ConceptsScreen. This catches already-persisted pipeline output that was saved before the extraction-service fix.

**Acceptance Criteria:**
- `concept.domain` is always a single trimmed domain string
- `concept.abstractionLevel` is always a valid enum value
- `concept.themes` is always a non-empty string array
- Both new AND previously-persisted concepts are normalized

---

## TODO 2: Fix empty content area — auto-cluster and fix rendering loop

**Files:**
- `src/screens/concepts/ConceptsScreen.tsx` lines 59-60, 134-146

**Changes:**

### 2a. Replace line 60 with auto-clustering (no fallback clause)

Replace:
```typescript
const clusters: Cluster[] = pipelineConcepts ? [] : MOCK_CLUSTERS
```

With:
```typescript
const clusters: Cluster[] = useMemo(() => {
  if (!pipelineConcepts) return MOCK_CLUSTERS
  // Auto-cluster by abstraction level
  const levelGroups = new Map<string, string[]>()
  concepts.forEach((c) => {
    const key = c.abstractionLevel || 'L2_APPROACH'
    if (!levelGroups.has(key)) levelGroups.set(key, [])
    levelGroups.get(key)!.push(c.id)
  })
  const levelLabels: Record<string, string> = {
    L1_SPECIFIC: 'L1 — Specific',
    L2_APPROACH: 'L2 — Approach',
    L3_PARADIGM: 'L3 — Paradigm',
  }
  return Array.from(levelGroups.entries()).map(([level, ids]) => ({
    id: `auto-${level}`,
    name: levelLabels[level] || level,
    domain: '',
    conceptIds: ids,
  }))
}, [pipelineConcepts, concepts])
```

No fallback clause needed — auto-clustering always produces non-empty clusters when concepts exist. The empty-concepts case is already handled by the early return at line 85.

### 2b. Fix rendering loop to use conceptIds instead of clusterId matching

Replace line 136:
```typescript
const clusterConcepts = filtered.filter((c) => c.clusterId === cluster.id)
```

With:
```typescript
const clusterConcepts = filtered.filter((c) => cluster.conceptIds.includes(c.id))
```

This is the critical fix: auto-generated clusters set `conceptIds` but concept objects have `clusterId: ''`, so the old `c.clusterId === cluster.id` match always returns zero results.

**Acceptance Criteria:**
- Real pipeline concepts render in auto-grouped clusters by abstraction level
- Cluster names show human-friendly labels: "L1 — Specific", "L2 — Approach", "L3 — Paradigm"
- Mock data path unchanged
- No dead-code fallback clause exists
- Empty state shown only when concepts array is truly empty

---

## TODO 3: Restructure FilterPanel as L1/L2/L3 accordion groups with level-toggle checkboxes

**Files:**
- `src/screens/concepts/FilterPanel.tsx` — full restructure
- `src/screens/concepts/ConceptsScreen.tsx` lines 66-68 — update filter data passed to FilterPanel

**New `FilterPanelProps` interface (replaces existing):**

```typescript
interface LevelFilterData {
  level: 'L1_SPECIFIC' | 'L2_APPROACH' | 'L3_PARADIGM'
  label: string          // "L1 — Specific", etc.
  domains: string[]      // unique domains for concepts at this level
  themes: string[]       // unique themes for concepts at this level
}

interface FilterPanelProps {
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

**Changes to ConceptsScreen (lines 66-68):**

Replace the three separate `useMemo` calls with one:

```typescript
const levelLabels: Record<string, string> = {
  L1_SPECIFIC: 'L1 — Specific',
  L2_APPROACH: 'L2 — Approach',
  L3_PARADIGM: 'L3 — Paradigm',
}

const levelFilters = useMemo(() => {
  const levels = ['L1_SPECIFIC', 'L2_APPROACH', 'L3_PARADIGM'] as const
  return levels
    .map((level) => {
      const levelConcepts = concepts.filter((c) => c.abstractionLevel === level)
      return {
        level,
        label: levelLabels[level],
        domains: unique(levelConcepts.map((c) => c.domain)).filter(Boolean),
        themes: unique(levelConcepts.flatMap((c) => c.themes)).filter(Boolean),
      }
    })
    .filter((lf) => lf.domains.length > 0 || lf.themes.length > 0) // hide empty levels
}, [concepts])
```

Pass `levelFilters` to FilterPanel instead of `domains`, `themes`, `levels`.

Keep existing `selectedDomains`, `selectedThemes`, `selectedLevels` state and filter logic unchanged (lines 70-77) — the filtering itself works fine already.

**Changes to FilterPanel structure:**

Replace three flat `<Section>` blocks with:

```tsx
import Accordion from '@/components/composites/Accordion.tsx'
import Checkbox from '@/components/ui/Checkbox.tsx'
import Button from '@/components/ui/Button.tsx'

// For each level, render an Accordion:
{levelFilters.map((lf) => (
  <Accordion key={lf.level} title={lf.label} defaultOpen={true}>
    <div className="flex flex-col gap-3 p-4">
      {/* Level toggle checkbox — checks/unchecks this entire level */}
      <Checkbox
        label={`All ${lf.label}`}
        checked={selectedLevels.includes(lf.level)}
        onChange={() => onLevelsChange(toggleItem(selectedLevels, lf.level))}
      />

      {/* Domain checkboxes for this level */}
      {lf.domains.length > 0 && (
        <div className="flex flex-col gap-2 pl-4">
          <h5 className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>Domains</h5>
          {lf.domains.map((d) => (
            <Checkbox
              key={d}
              label={d}
              checked={selectedDomains.includes(d)}
              onChange={() => onDomainsChange(toggleItem(selectedDomains, d))}
            />
          ))}
        </div>
      )}

      {/* Theme checkboxes for this level */}
      {lf.themes.length > 0 && (
        <div className="flex flex-col gap-2 pl-4">
          <h5 className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>Themes</h5>
          {lf.themes.map((t) => (
            <Checkbox
              key={t}
              label={t}
              checked={selectedThemes.includes(t)}
              onChange={() => onThemesChange(toggleItem(selectedThemes, t))}
            />
          ))}
        </div>
      )}
    </div>
  </Accordion>
))}
```

**Behavior clarification:**
- **Accordion header click:** Expand/collapse the accordion content only (handled by Accordion component)
- **Level checkbox ("All L1 — Specific"):** Toggles that level in `selectedLevels`, which filters concepts at that abstraction level on/off
- These are independent: you can collapse an accordion without hiding concepts, and vice versa

**Acceptance Criteria:**
- Filter panel shows L1, L2, L3 as Accordion items (collapsible)
- Each accordion has a level-toggle Checkbox at the top
- Below the toggle: domain checkboxes + theme checkboxes for that level
- Selecting/deselecting filters correctly shows/hides concepts
- Design tokens preserved (var(--color-*), var(--radius-*), var(--text-*))
- Empty levels are hidden (no empty accordions)

---

## TODO 4: Build verification

**Commands:**
```bash
npx tsc --noEmit
npm run build
```

**Acceptance Criteria:**
- Zero TypeScript errors
- Build succeeds
- No console errors when viewing Concepts screen with real data

---

## Commit Strategy

Single commit: `fix(concepts): normalize LLM data, fix cluster rendering loop, add L1/L2/L3 accordion filters`

## Success Criteria

1. Real LLM concepts render in grouped containers (using `conceptIds.includes`)
2. Domain filters show individual domains (normalized at both boundaries)
3. Filter panel has L1/L2/L3 accordion hierarchy with level-toggle checkboxes
4. Cluster labels are human-friendly ("L1 — Specific", "L2 — Approach", "L3 — Paradigm")
5. No dead-code fallback clause for empty clusters
6. Mock data still works
7. Build passes with zero errors
