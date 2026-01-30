# Design Token Adoption - Swarm Task Plan

**Created:** 2026-01-30
**Type:** Swarm (all tasks independent, parallelizable)
**Total Tasks:** 18
**Estimated Complexity:** Mostly LOW

---

## Task 1: Font-weight tokens in SourceExcerptsStrip
**File(s):** `src/screens/explorer/SourceExcerptsStrip.module.css`
**Action:** Replace hardcoded font-weight with token
**Token(s):** `var(--font-weight-semibold)`
**Complexity:** LOW
**Details:**
- Line 44: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`

---

## Task 2: Font-weight tokens in DetailPanel
**File(s):** `src/screens/explorer/DetailPanel.module.css`
**Action:** Replace hardcoded font-weight with token
**Token(s):** `var(--font-weight-semibold)`
**Complexity:** LOW
**Details:**
- Line 20: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`
- Line 27: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`
- Line 92: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`

---

## Task 3: Font-weight tokens in MediaReactiveDisplay (part 1)
**File(s):** `src/screens/explorer/MediaReactiveDisplay.module.css`
**Action:** Replace hardcoded font-weight with token (first 3 occurrences)
**Token(s):** `var(--font-weight-semibold)`
**Complexity:** LOW
**Details:**
- Line 12: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`
- Line 30: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`
- Line 70: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`

---

## Task 4: Font-weight tokens in MediaReactiveDisplay (part 2)
**File(s):** `src/screens/explorer/MediaReactiveDisplay.module.css`
**Action:** Replace hardcoded font-weight with token (remaining occurrences)
**Token(s):** `var(--font-weight-semibold)`
**Complexity:** LOW
**Details:**
- Line 89: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`
- Line 122: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`
- Line 129: `font-weight: 600` → `font-weight: var(--font-weight-semibold)`

> **Note:** Tasks 3 and 4 touch the same file. Swarm coordinator should assign both to the same agent OR run sequentially. Alternatively, combine into one task if agent supports it.

---

## Task 5: Line-height tokens in SourceExcerptsStrip
**File(s):** `src/screens/explorer/SourceExcerptsStrip.module.css`
**Action:** Replace hardcoded line-height with token
**Token(s):** `var(--leading-tight)`
**Complexity:** LOW
**Details:**
- Line 55: `line-height: 1.4` → `line-height: var(--leading-tight)`
- Note: 1.4 is between tight (1.2) and normal (1.5). Use `--leading-tight` if design intent is compact, otherwise keep as-is. Agent should check visual context.

---

## Task 6: Line-height tokens in DetailPanel
**File(s):** `src/screens/explorer/DetailPanel.module.css`
**Action:** Replace hardcoded line-height with token
**Token(s):** `var(--leading-tight)`
**Complexity:** LOW
**Details:**
- Line 99: `line-height: 1.4` → `line-height: var(--leading-tight)`
- Line 35: Already uses `--leading-normal` - no change needed. Verify only.

---

## Task 7: Line-height tokens in MediaReactiveDisplay
**File(s):** `src/screens/explorer/MediaReactiveDisplay.module.css`
**Action:** Replace hardcoded line-height with token
**Token(s):** `var(--leading-normal)`
**Complexity:** LOW
**Details:**
- Line 25: `line-height: 1.6` → `line-height: var(--leading-normal)`
- Line 83: `line-height: 1.6` → `line-height: var(--leading-normal)`

---

## Task 8: Focus ring in globals.css
**File(s):** `src/styles/globals.css`
**Action:** Replace inline focus outline with token
**Token(s):** `var(--focus-ring)`
**Complexity:** LOW
**Details:**
- Line 61: `outline: 2px solid var(--color-cyan)` → `outline: var(--focus-ring)`

---

## Task 9: Focus ring in SettingsModal
**File(s):** `src/components/global/SettingsModal.module.css`
**Action:** Replace inline focus outline with token
**Token(s):** `var(--focus-ring)`
**Complexity:** LOW
**Details:**
- Line 23: `outline: 2px solid var(--color-cyan)` → `outline: var(--focus-ring)`

---

## Task 10: Opacity tokens in Button and Toggle
**File(s):** `src/components/ui/Button.tsx`, `src/components/ui/Toggle.tsx`
**Action:** Replace hardcoded opacity with token
**Token(s):** `var(--opacity-disabled)` (or Tailwind arbitrary value)
**Complexity:** MEDIUM
**Details:**
- Button.tsx line 39: `opacity-40` → `opacity-[var(--opacity-disabled)]`
- Toggle.tsx line 14: `opacity-40` → `opacity-[var(--opacity-disabled)]`
- These are Tailwind classes. Use arbitrary value syntax.

---

## Task 11: Opacity token in LoadingStates
**File(s):** `src/components/global/LoadingStates.tsx`
**Action:** Replace hardcoded opacity with token
**Token(s):** `var(--opacity-disabled)`
**Complexity:** LOW
**Details:**
- Line 20: `opacity: 0.4` → `opacity: var(--opacity-disabled)`

---

## Task 12: Opacity tokens in AssetGenerationModal
**File(s):** `src/screens/provenance/AssetGenerationModal.tsx`
**Action:** Replace hardcoded opacity with token
**Token(s):** `var(--opacity-muted)`
**Complexity:** LOW
**Details:**
- Line 111: `opacity: 0.5` → `opacity: var(--opacity-muted)`
- Line 142: `opacity: 0.5` → `opacity: var(--opacity-muted)`

---

## Task 13: Transition tokens in ResultCard
**File(s):** `src/screens/results/ResultCard.tsx`
**Action:** Replace hardcoded transition with tokens
**Token(s):** `var(--duration-normal)`, `var(--ease-default)`
**Complexity:** LOW
**Details:**
- Line 24: `transition: 'all 0.2s ease'` → `transition: 'all var(--duration-normal) var(--ease-default)'`

---

## Task 14: Transition tokens in SourcePanel
**File(s):** `src/screens/provenance/SourcePanel.tsx`
**Action:** Replace hardcoded transition with tokens
**Token(s):** `var(--duration-normal)`, `var(--ease-default)`
**Complexity:** LOW
**Details:**
- Line 52: `transition: 'all 0.2s ease'` → `transition: 'all var(--duration-normal) var(--ease-default)'`

---

## Task 15: Transition tokens in ClaimsPanel
**File(s):** `src/screens/provenance/ClaimsPanel.tsx`
**Action:** Replace hardcoded transition with tokens
**Token(s):** `var(--duration-normal)`, `var(--ease-default)`
**Complexity:** LOW
**Details:**
- Line 51: `transition: 'all 0.2s ease'` → `transition: 'all var(--duration-normal) var(--ease-default)'`

---

## Task 16: Transition tokens in SourceExcerptsStrip (CSS)
**File(s):** `src/screens/explorer/SourceExcerptsStrip.module.css`
**Action:** Replace hardcoded transition with tokens
**Token(s):** `var(--duration-normal)`, `var(--ease-default)`
**Complexity:** LOW
**Details:**
- Line 29: `transition: all 0.2s` → `transition: all var(--duration-normal) var(--ease-default)`

---

## Task 17: Glow tokens in UploadQueue and IngestionProgress
**File(s):** `src/screens/upload/UploadQueue.tsx`, `src/screens/upload/IngestionProgress.tsx`
**Action:** Replace hardcoded glow shadows with tokens
**Token(s):** `var(--glow-cyan-sm)`
**Complexity:** MEDIUM
**Details:**
- UploadQueue.tsx line 58: `hover:shadow-[0_0_8px_rgba(0,255,255,0.1)]` → `hover:shadow-[var(--glow-cyan-sm)]`
- IngestionProgress.tsx line 51: `shadow-[0_0_8px_rgba(0,255,255,0.15)]` → `shadow-[var(--glow-cyan-sm)]`

---

## Task 18: Glow tokens in DropZone and ConceptCard
**File(s):** `src/screens/upload/DropZone.tsx`, `src/screens/concepts/ConceptCard.tsx`
**Action:** Replace hardcoded glow shadows with tokens
**Token(s):** `var(--glow-cyan-sm)`, `var(--glow-cyan-md)`, `var(--glow-cyan-lg)`
**Complexity:** MEDIUM
**Details:**
- DropZone.tsx line 75: `shadow-[0_0_20px_rgba(0,255,255,0.3)]` → `shadow-[var(--glow-cyan-lg)]`
- DropZone.tsx line 76: `shadow-[0_0_12px_rgba(0,255,255,0.15)]` → `shadow-[var(--glow-cyan-md)]`
- ConceptCard.tsx line 27: `shadow-[0_0_8px_rgba(0,255,255,0.15)]` → `shadow-[var(--glow-cyan-sm)]`

---

## Summary

| Category | Tasks | Files Touched | Complexity |
|----------|-------|---------------|------------|
| Font-weight | 1-4 | 3 | LOW |
| Line-height | 5-7 | 3 | LOW |
| Focus ring | 8-9 | 2 | LOW |
| Opacity | 10-12 | 4 | LOW-MEDIUM |
| Transitions | 13-16 | 4 | LOW |
| Glow shadows | 17-18 | 4 | MEDIUM |
| **Total** | **18** | **~14 unique files** | **Mostly LOW** |

## Swarm Notes

- Tasks 3 and 4 share `MediaReactiveDisplay.module.css` - assign to same agent or merge
- Tasks 1, 5, 16 share `SourceExcerptsStrip.module.css` - assign to same agent or merge
- Tasks 2, 6 share `DetailPanel.module.css` - assign to same agent or merge
- All other tasks are fully independent
- No task depends on any other task completing first
- All design tokens are already defined in the codebase
