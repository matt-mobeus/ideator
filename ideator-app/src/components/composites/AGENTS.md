<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Composite Components

## Purpose

Multi-element components built from base UI primitives. Implements complex interaction patterns like modals, accordions, tabs, and toast notifications. Provides higher-level abstractions for common UI patterns with built-in state management and accessibility.

## Key Files

| File | Description |
|------|-------------|
| `Modal.tsx` | Modal dialog with backdrop and focus trap |
| `Card.tsx` | Card container with header/body/footer sections |
| `Toast.tsx` | Toast notification with variants and auto-dismiss |
| `Tabs.tsx` | Tabbed interface with keyboard navigation |
| `Accordion.tsx` | Collapsible accordion with multiple items |
| `SearchInput.tsx` | Search input with debounce and clear button |
| `FilterDropdown.tsx` | Multi-select filter dropdown |
| `ProgressBar.tsx` | Progress indicator with label and percentage |
| `Breadcrumb.tsx` | Breadcrumb navigation trail |
| `Skeleton.tsx` | Loading skeleton placeholder |
| `EmptyState.tsx` | Empty state with icon and message |
| `ErrorState.tsx` | Error state with retry action |
| `index.ts` | Component exports |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Composition**: Build from `ui/` components, not from scratch
2. **State Management**: Internal state with hooks (useState, useEffect)
3. **Events**: Expose callbacks like `onClose`, `onSelect`, `onChange`
4. **Portal Rendering**: Use portals for modals, tooltips, dropdowns

### Testing

- Test open/close interactions
- Verify keyboard shortcuts (Esc, Enter, Arrow keys)
- Test focus management and trapping
- Validate accessibility with screen readers

### Common Patterns

- **Compound Pattern**: `<Tabs><Tabs.List><Tabs.Panel>` structure
- **Controlled State**: Support both controlled and uncontrolled modes
- **Portal Usage**: `ReactDOM.createPortal` for overlays
- **Focus Management**: `useRef` + `focus()` for accessibility

## Dependencies

### Internal
- Base components from `@/components/ui`
- Utility hooks (if any in `@/hooks`)
- Types from `@/types/`

### External
- **React 19** - Hooks and portals
- **clsx** - Class composition

<!-- MANUAL: -->
