# Autopilot: Design Token Spec Implementation

## Status: ALL PHASES COMPLETE (P0-P6)
## Completed: P0, P1, P2, P3, P4, P5a, P5b, P5c, P5d, P6

## Execution Plan

### Phase P0: Define Phantom Tokens
- Add 8 phantom token definitions to `src/styles/tokens.css`
- Code review after

### Phase P1: Remove Dead Tokens
- Delete 28 unused tokens from `src/styles/tokens.css`
- Code review after

### Phase P2: Add Missing Token Categories
- Add elevation, layout, typography completion, focus states, opacity scale
- Code review after

### Phase P3: Standardize Glow System
- Define 3 intensity levels per color
- Replace ~7 hardcoded glow values across ~5 files
- Code review after

### Phase P4: Semantic Color Aliases
- Add semantic aliases (primary, accent, success, warning, danger)
- Code review after

### Phase P5: Normalize Inline Styles
- P5a: SettingsModal refactor (~200 inline styles)
- P5b: Explorer screen refactor
- P5c: Icon size standardization (~15 files)
- P5d: Hardcoded font/spacing migration (~30 files)
- Code review after each sub-phase

### Phase P6: Future-Proofing
- Theme-switching structure
- Glass morphism tokens
- Animation choreography tokens
- Code review after

## Key File
- Token definitions: `src/styles/tokens.css`
- Spec: `.omc/plans/design-token-spec.md`

## Notes
- Build must pass after each phase (`npm run build`)
- Context was at 100% before starting - use /compact or /clear between phases if needed
