<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Layout Components

## Purpose

Structural layout components providing application shell, responsive containers, and device-specific wrappers. Handles overall page structure, mobile/desktop detection, and content flow. Provides consistent layout patterns across all screens.

## Key Files

| File | Description |
|------|-------------|
| `AppShell.tsx` | Main application shell with flex layout |
| `MobileBlock.tsx` | Mobile device blocker (desktop-only app message) |
| `index.ts` | Layout component exports |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **AppShell**: Wraps entire app, provides flex container structure
2. **MobileBlock**: Shows warning on mobile, blocks access to app
3. **Responsive**: Layout adapts to screen size with CSS custom properties
4. **Nesting**: Layout components wrap screens and global components

### Testing

- Test responsive behavior at breakpoints
- Verify mobile blocking on small screens
- Test flex layout with different content heights
- Validate scroll behavior

### Common Patterns

- **Flex Layout**: `flex flex-col h-screen` for full-height app
- **Media Queries**: CSS or JS-based responsive detection
- **Scroll Containers**: Separate scroll regions for nav vs content
- **Z-Index Layers**: Proper stacking for overlays

## Dependencies

### Internal
- May use base components from `@/components/ui`
- CSS custom properties from `@/styles/`

### External
- **React 19** - Component framework

<!-- MANUAL: -->
