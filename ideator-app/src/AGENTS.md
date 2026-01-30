<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Source Code Root

## Purpose

Main source directory containing all application code organized into functional layers: configuration, database, networking, services (business logic), UI components, screens (pages), workers (background processing), type definitions, and styling. Follows a clear separation of concerns with distinct boundaries between data access, API communication, domain logic, and presentation.

## Key Files

| File | Description |
|------|-------------|
| `main.tsx` | React application entry point, renders App in StrictMode |
| `App.tsx` | Root component with BrowserRouter, routes, and AppShell layout |
| `index.css` | Global CSS imports and base styles |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `config/` | Application and network configuration |
| `db/` | Dexie database schema and access layer |
| `network/` | HTTP client, API services, resilience patterns |
| `services/` | Business logic: file processing, clustering, search |
| `components/` | React components organized by complexity |
| `screens/` | Full-page route components |
| `workers/` | Web Workers for CPU-intensive tasks |
| `types/` | TypeScript type definitions |
| `styles/` | CSS modules and design tokens |
| `assets/` | Static images and resources |
| `hooks/` | Custom React hooks (currently empty) |
| `stores/` | Zustand state stores (currently empty) |
| `visualizations/` | D3-based visualization components |

## For AI Agents

### Working Instructions

1. **Path Aliases**: Import from `@/` for src root (e.g., `@/components/ui`)
2. **Layer Boundaries**:
   - Services call network and db, not components
   - Components call services, not network directly
   - Workers are isolated, communicate via postMessage
3. **Routing**: All routes defined in `App.tsx`, use React Router hooks in screens

### Testing

- No automated tests configured yet
- Manual testing via component rendering in screens
- Worker testing via console logs and postMessage verification

### Common Patterns

- **Service Pattern**: Stateless functions exported from service files
- **Component Organization**: ui (base) → composites → layout → global
- **Worker Communication**: Typed message interfaces, postMessage/onmessage
- **Type Safety**: Strict TypeScript, shared types in `types/` directory

## Dependencies

### Internal
- All subdirectories are internal dependencies
- Cross-layer imports follow unidirectional flow
- Shared types imported from `types/index.ts`

### External
- React and ReactDOM for UI
- React Router for navigation
- Dexie for database operations
- File parsing libraries (accessed via services)

<!-- MANUAL: -->
