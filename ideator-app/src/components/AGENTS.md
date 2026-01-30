<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# React Components

## Purpose

Presentation layer organized by complexity: base UI primitives, composite components, layout structure, and global elements. Components are reusable, typed with TypeScript, and styled with Tailwind CSS utilities. Implements consistent design system with CSS custom properties for theming.

## Key Files

None (organized into subdirectories by type)

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `ui/` | Base UI primitives (Button, Input, Icon, etc.) |
| `composites/` | Multi-element components (Card, Modal, Toast, etc.) |
| `layout/` | Layout structure (AppShell, MobileBlock) |
| `global/` | App-wide components (TopNav, GlobalSearchModal, ToastContainer) |

## For AI Agents

### Working Instructions

1. **Component Hierarchy**: ui → composites → layout → global (increasing complexity)
2. **Styling**: Use Tailwind utilities + CSS custom properties from design tokens
3. **Props**: Type all props with TypeScript interfaces
4. **Exports**: Export from index.ts in each subdirectory

### Testing

- Test components in isolation with Storybook (if configured)
- Manual testing by importing into screens
- Verify responsive behavior at different breakpoints
- Test accessibility with keyboard navigation

### Common Patterns

- **Compound Components**: For complex UI (Tabs, Accordion)
- **Render Props**: For flexible content composition
- **Controlled/Uncontrolled**: Support both patterns where applicable
- **Forward Refs**: For components wrapping native elements

## Dependencies

### Internal
- Types from `@/types/`
- Design tokens from `@/styles/`
- Icons and assets from `@/assets/`

### External
- **React 19** - Component framework
- **clsx** - Conditional class names
- **Tailwind CSS** - Utility styling

<!-- MANUAL: -->
