# Frontend Remediation - Session Learnings

## Date: 2026-02-02

## Critical Root Cause Found

### `globals.css` Universal Reset Kills ALL Tailwind Utilities

**The Problem:**
```css
/* globals.css lines 6-10 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

In Tailwind CSS v4, ALL utilities are inside `@layer utilities`. CSS cascade rules state that **unlayered CSS always beats layered CSS**. The universal `* { padding: 0 }` reset is unlayered, so it overrides every Tailwind padding, margin, and gap utility (`p-5`, `px-3`, `gap-4`, `mb-6`, etc.) across the entire app.

**The Fix (applied):**
```css
@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}
```

Wrapping in `@layer base` gives it lower priority than `@layer utilities`, allowing Tailwind classes to work.

**Why it took so long to find:** We spent 3 cycles adjusting Tailwind classes (p-4→p-5, gap-4→gap-6, etc.) that were correct but invisible because the cascade bug nullified all of them. The changes existed on disk, TypeScript compiled fine, build passed — but the browser rendered zero padding/margin everywhere.

**Lesson:** When Tailwind utilities aren't working, ALWAYS check for unlayered CSS resets first. Inspect computed styles in browser DevTools to see if padding resolves to 0.

---

## Other Issues Found & Fixed

### 1. Invalid `duration-[var(--transition-default)]` (FIXED)
- Token `--transition-default: 150ms ease` includes easing function
- `duration-` utility only accepts time values → generates invalid CSS
- Browser silently ignores it → all transitions broken
- Fixed: replaced with `duration-[var(--duration-normal)]` (pure `200ms` value)
- Affected 13 occurrences across 10 files

### 2. Height Chain Broken in PageLayout (FIXED)
- `PageLayout` inner `div.mx-auto` had no flex properties
- `h-full` on child screens resolved to nothing
- SplitPanel, empty states all collapsed
- Fixed: added `flex-1 flex flex-col` to inner wrapper

### 3. Double Vertical Padding (FIXED)
- `PageLayout` applies `padding: var(--layout-gutter)` (1.5rem all sides)
- Every screen ALSO had `py-6` (1.5rem) → 3rem total top/bottom
- Fixed: removed `py-6` from all 5 screen root containers

### 4. SplitPanel Nested `<main>` (FIXED)
- `App.tsx` wraps routes in `<main>`, SplitPanel used `<main>` internally
- Nested `<main>` is an accessibility violation
- Fixed: changed to `<section>`

---

## Issues Still Outstanding (P1)

### 5. ConceptsScreen renders NOTHING with real pipeline data
- Line 60: `const clusters = pipelineConcepts ? [] : MOCK_CLUSTERS`
- When real data arrives, clusters is `[]`, but rendering iterates clusters → empty
- **FIX NEEDED:** Add fallback rendering for unclustered concepts

### 6. All other screens hardcoded to mock data
- `useState(true)` for `useMock` with no mechanism to switch
- AnalyzeScreen, ResultsScreen, ProvenanceScreen, ExplorerScreen
- **FIX NEEDED:** Connect to pipeline store like ConceptsScreen does

### 7. No field validation from LLM output
- `parseJsonSafe<T>` does raw JSON.parse with type assertion, no runtime validation
- Missing `themes`, `sourceReferences` etc. will be `undefined` → TypeError
- **FIX NEEDED:** Default missing arrays to `[]` in concept-extraction.service.ts

### 8. Inconsistent color tokens
- `--accent-cyan: #00e5ff` vs `--color-cyan: #00ffff` (different blues)
- AnalysisTrigger.tsx uses `--accent-cyan`, everything else uses `--color-cyan`

### 9. Date serialization
- `result.analyzedAt.toLocaleString()` - Date objects become strings through JSON round-trip

---

## Spacing Changes Applied (now visible with cascade fix)

| File | Change |
|------|--------|
| All 5 screens | `py-6` removed (PageLayout handles gutter) |
| All 5 screens | `gap-6` standardized |
| PageLayout | `flex-1 flex flex-col` on inner wrapper |
| PageHeader | Removed `mb-6` |
| Card | `p-4` → `p-5` |
| ConceptCard | `p-4` → `p-5` |
| FilterPanel | `gap-6` → `gap-8`, `p-4` → `p-5`, Section `gap-2` → `gap-3` |
| ClusterContainer | `gap-4` → `gap-5` |
| TierAccordion | Removed double `p-4`, `gap-4` → `gap-5` |
| Accordion | Added `bg-[var(--bg-primary)]` to content |
| Modal | `mb-4` → `mb-6` |
| Breadcrumb | `gap-1` → `gap-2` |
| Tabs | `gap-0` → `gap-1` |
| UploadQueue | `p-4` → `p-5` |
| IngestionProgress | `p-4` → `p-5` |
| ProgressBar | `duration-300` → `duration-[var(--duration-slow)]` |
| ResultDetailPanel | `rounded-lg` → `rounded-[var(--radius-md)]` (2 instances) |
| 10 files | `duration-[var(--transition-default)]` → `duration-[var(--duration-normal)]` |

---

## OMC Plugin Status
- Version 3.9.6 installed, 3.9.8 available
- Skills like `learner`, `ralplan` exist in filesystem but NOT registered with Claude Code skill runtime
- Only `keybindings-help` shows as available skill
- **ACTION:** Clear cache (`rm -rf ~/.claude/plugins/cache/omc/oh-my-claudecode`) and restart to update
