<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Global Components

## Purpose

Application-wide components rendered at root level including top navigation, global search modal, toast notifications container, and loading states. These components persist across route changes and provide app-level functionality accessible from anywhere.

## Key Files

| File | Description |
|------|-------------|
| `TopNav.tsx` | Top navigation bar with logo, search, and actions |
| `GlobalSearchModal.tsx` | Keyboard-accessible global search (Cmd+K) |
| `ToastContainer.tsx` | Container for toast notifications with positioning |
| `LoadingStates.tsx` | App-wide loading indicators |
| `index.ts` | Global component exports |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **TopNav**: Fixed position at top, visible on all routes
2. **GlobalSearch**: Toggle with keyboard shortcut, portal rendered
3. **ToastContainer**: Renders in portal, manages toast stack
4. **Loading**: Full-page or inline loading states

### Testing

- Test navigation across routes (stays visible)
- Verify Cmd+K / Ctrl+K opens global search
- Test toast stacking and auto-dismiss
- Validate loading state transitions

### Common Patterns

- **Portal Rendering**: Use portals for modals and overlays
- **Keyboard Shortcuts**: `useEffect` with event listeners
- **Global State**: May connect to Zustand stores
- **Z-Index Management**: Proper layering for overlays

## Dependencies

### Internal
- Base and composite components from `@/components/`
- Services for search functionality
- Types from `@/types/`

### External
- **React 19** - Hooks and portals
- **React Router** - Navigation state

<!-- MANUAL: -->
