# Design Token Spec - IDEATOR App

**Date:** 2026-01-30
**Status:** Ready for implementation
**Source:** Architect audit + Designer audit + Design Critic audit

---

## Executive Summary

The IDEATOR design token system is ~60% complete. 61 tokens defined, 33 used, 8 phantom tokens silently broken, ~40% of components bypass tokens via inline styles. This spec provides exact CSS and file-level guidance to bring it to production grade.

---

## P0 - CRITICAL: Define Phantom Tokens

**Problem:** 8 CSS custom properties are referenced across the codebase but never defined. Browsers silently fall back to `initial`, causing invisible breakage.

**Action:** Add these definitions to `:root` in the main CSS file (likely `src/index.css` or `src/styles/tokens.css`).

```css
:root {
  /* P0: Phantom token definitions */
  --border-primary: rgba(0, 255, 255, 0.15);      /* cyan border, consistent with accent */
  --border-subtle: rgba(255, 255, 255, 0.06);      /* near-invisible separator */
  --text-tertiary: rgba(255, 255, 255, 0.4);       /* lowest readable text */
  --bg-tertiary: rgba(255, 255, 255, 0.03);        /* barely-there background */
  --bg-hover: rgba(255, 255, 255, 0.08);           /* interactive hover state */
  --bg-base: #0a0a0f;                              /* deepest background */
  --accent-cyan: #00e5ff;                           /* cyan accent for highlights */
  --color-purple: #a855f7;                          /* purple accent */
}
```

**Files affected:** 9+ files reference `--border-primary`, 7+ reference `--text-tertiary`, 4 files each for `--border-subtle`, `--bg-hover`, `--accent-cyan`. Total: ~20 unique files already using these; no changes needed there once defined.

**Scope:** 1 file to edit (token definition file). Immediate visual fixes across ~20 files.

---

## P1 - HIGH: Remove Dead Tokens

**Problem:** 28 defined tokens are never referenced. 8 spacing tokens and 5 font-size tokens are dead because Tailwind handles those concerns.

### Tokens to DELETE (28)

**Spacing tokens (8) - Tailwind replaces these:**
```
--spacing-xs
--spacing-sm
--spacing-md
--spacing-lg
--spacing-xl
--spacing-2xl
--spacing-3xl
--spacing-4xl
```

**Font-size tokens (5) - Tailwind replaces these:**
```
--font-size-xs
--font-size-sm
--font-size-lg
--font-size-xl
--font-size-2xl
```
Keep `--font-size-base` (it is used).

**Other unused tokens (15) - audit each; likely dead:**
Review remaining 15 unused tokens individually. If no component references them after phantom token fix, delete. Candidates include any color primitives that have no semantic alias pointing to them and no direct usage.

### Decision Record

Tailwind utility classes handle spacing and font-size. Maintaining parallel CSS custom property systems creates confusion. Delete CSS spacing/font-size tokens and standardize on Tailwind for those categories. Keep CSS custom properties for colors, effects, and layout values that Tailwind does not natively express.

**Scope:** 1 file (token definitions). Remove ~28 variable declarations.

---

## P2 - HIGH: Add Missing Token Categories

### 2a. Elevation System (6 levels)

```css
:root {
  --shadow-none: none;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
  --shadow-2xl: 0 24px 64px rgba(0, 0, 0, 0.7);
}
```

### 2b. Layout Tokens

```css
:root {
  --layout-content-max: 1280px;
  --layout-gutter: 1.5rem;        /* 24px */
  --layout-sidebar-width: 280px;
  --layout-touch-target: 44px;    /* minimum tap target */
  --layout-header-height: 56px;
}
```

### 2c. Typography Completion

```css
:root {
  /* Line heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Font weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
  --tracking-wider: 0.1em;      /* for uppercase labels */
}
```

### 2d. Focus State Tokens

```css
:root {
  --focus-ring-color: rgba(0, 229, 255, 0.5);
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring: var(--focus-ring-width) solid var(--focus-ring-color);
}
```

### 2e. Opacity Scale

```css
:root {
  --opacity-disabled: 0.38;
  --opacity-muted: 0.5;
  --opacity-subtle: 0.7;
  --opacity-full: 1;
}
```

**Scope:** 1 file (token definitions). ~25 new declarations. Adoption across components is a separate task per P5.

---

## P3 - MEDIUM: Standardize Glow System

**Problem:** 7 different cyan glow `box-shadow` values scattered across the codebase with no consistency.

### Define 3 Intensity Levels Per Color

```css
:root {
  /* Cyan glow */
  --glow-cyan-sm: 0 0 8px rgba(0, 229, 255, 0.15);
  --glow-cyan-md: 0 0 16px rgba(0, 229, 255, 0.25);
  --glow-cyan-lg: 0 0 32px rgba(0, 229, 255, 0.35);

  /* Purple glow */
  --glow-purple-sm: 0 0 8px rgba(168, 85, 247, 0.15);
  --glow-purple-md: 0 0 16px rgba(168, 85, 247, 0.25);
  --glow-purple-lg: 0 0 32px rgba(168, 85, 247, 0.35);

  /* Green glow (success states) */
  --glow-green-sm: 0 0 8px rgba(34, 197, 94, 0.15);
  --glow-green-md: 0 0 16px rgba(34, 197, 94, 0.25);
  --glow-green-lg: 0 0 32px rgba(34, 197, 94, 0.35);
}
```

### Migration

Search for all `box-shadow` values containing `rgba(0, 229, 255` or `rgba(0, 255, 255` and replace with the closest glow token. Estimated 7+ inline glow values to replace across ~5 files.

**Scope:** 1 file for definitions, ~5 files for replacements.

---

## P4 - MEDIUM: Add Semantic Color Aliases

**Problem:** Components reference raw color tokens directly, making theme changes require touching every file.

```css
:root {
  /* Semantic aliases pointing to primitives */
  --color-primary: var(--accent-cyan);
  --color-accent: var(--color-purple);
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: var(--accent-cyan);

  /* Surface semantics */
  --surface-primary: var(--bg-base);
  --surface-secondary: var(--bg-secondary, rgba(255, 255, 255, 0.05));
  --surface-tertiary: var(--bg-tertiary);
  --surface-elevated: rgba(255, 255, 255, 0.08);

  /* Text semantics */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.6);
  /* --text-tertiary already defined in P0 */

  /* Border semantics */
  /* --border-primary and --border-subtle already defined in P0 */
  --border-default: rgba(255, 255, 255, 0.1);
}
```

**Scope:** 1 file for definitions. Adoption is gradual -- new code uses semantic names, existing code migrated file-by-file.

---

## P5 - MEDIUM: Normalize Inline Styles

### 5a. SettingsModal Refactoring

**Problem:** ~200 lines of inline styles in SettingsModal using px values while rest of app uses rem.

**Plan:**
1. Create `src/components/SettingsModal.module.css` (or equivalent CSS module / Tailwind classes)
2. Extract all inline `style={{}}` objects into classes
3. Convert all px values to rem (divide by 16)
4. Replace hardcoded colors with token references
5. Estimated: 1 file rewrite, ~200 lines of inline styles to extract

### 5b. Explorer Screen Refactoring

**Plan:** Same approach as SettingsModal. Extract inline styles to CSS module or Tailwind classes. Scope TBD after file audit.

### 5c. Icon Size Standardization

**Problem:** 5 different icon sizes (12, 14, 16, 18, 20) with no system.

**Define 3 sizes:**
```css
:root {
  --icon-sm: 1rem;     /* 16px */
  --icon-md: 1.25rem;  /* 20px */
  --icon-lg: 1.5rem;   /* 24px */
}
```

Search all icon `size`, `width`, `height` props. Map:
- 12px, 14px, 16px -> `--icon-sm` (16px)
- 18px, 20px -> `--icon-md` (20px)
- 24px+ -> `--icon-lg` (24px)

**Scope:** ~15-20 files with icon references. Token definition: 1 file.

### 5d. Hardcoded Font Sizes and Spacing

**Problem:** ~47 hardcoded font-size inline styles, ~35 hardcoded spacing inline styles.

**Plan:** Replace with Tailwind utility classes (`text-sm`, `text-base`, `p-4`, `gap-2`, etc.). This is a bulk migration best done file-by-file. Estimated ~30 files affected.

---

## P6 - LOW: Future-Proofing

### 6a. Theme-Switching Structure

Prepare for light theme by wrapping current tokens in `[data-theme="dark"]` selector:

```css
:root,
[data-theme="dark"] {
  /* all current tokens */
}

[data-theme="light"] {
  --bg-base: #ffffff;
  --text-primary: rgba(0, 0, 0, 0.87);
  --text-secondary: rgba(0, 0, 0, 0.6);
  --text-tertiary: rgba(0, 0, 0, 0.38);
  --border-primary: rgba(0, 0, 0, 0.12);
  --border-subtle: rgba(0, 0, 0, 0.06);
  /* ... override each token */
}
```

### 6b. Glass Morphism Tokens

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 12px;
  --glass-saturate: 1.5;
}
```

### 6c. Responsive Tokens

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```
Note: CSS custom properties cannot be used in `@media` queries. These serve as documentation and JS references. Actual breakpoints use Tailwind's responsive prefixes.

### 6d. Animation Choreography

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 400ms;
  --duration-glacial: 800ms;

  --delay-stagger: 50ms;
}
```

**Scope:** All P6 items are additive. No existing code changes required. Adopt incrementally.

---

## Implementation Order

| Priority | Task | Files Changed | Effort |
|----------|------|---------------|--------|
| P0 | Define 8 phantom tokens | 1 | 15 min |
| P1 | Delete 28 dead tokens | 1 | 15 min |
| P2 | Add missing categories | 1 | 30 min |
| P3 | Standardize glow system | ~6 | 1 hr |
| P4 | Semantic color aliases | 1 | 15 min |
| P5a | SettingsModal refactor | 1-2 | 2 hr |
| P5b | Explorer refactor | 1-2 | 1.5 hr |
| P5c | Icon sizes | ~15 | 1 hr |
| P5d | Inline style migration | ~30 | 4 hr |
| P6 | Future-proofing tokens | 1 | 30 min |

**Total estimated effort:** ~11 hours of implementation work.

**Recommended approach:** P0 and P1 in one commit (immediate wins). P2+P4 in next commit (foundations). P3 standalone. P5 broken into per-component PRs. P6 as needed.

---

## Success Criteria

- Zero phantom tokens (all referenced tokens are defined)
- Zero dead tokens (all defined tokens are referenced)
- All glow effects use tokenized values (3 intensities per color)
- SettingsModal has zero inline styles
- Icon sizes use exactly 3 standard sizes
- Semantic aliases exist for all color intentions
- Token coverage: 90%+ of visual properties flow through tokens
