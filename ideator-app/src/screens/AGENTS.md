<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Screen Components

## Purpose

Full-page route components representing main application views. Each screen orchestrates components, services, and data flow for a specific user workflow. Screens are mapped to routes in App.tsx and handle their own state management, data fetching, and user interactions.

## Key Files

None (organized into subdirectories by screen)

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `upload/` | File upload and processing screen |
| `concepts/` | Concept clustering and visualization screen |
| `analyze/` | Document analysis screen (placeholder) |
| `provenance/` | Provenance tracking screen (placeholder) |
| `results/` | Results display screen (placeholder) |
| `explorer/` | Data exploration screen (placeholder) |

## For AI Agents

### Working Instructions

1. **Screen Structure**: Each screen is a default export imported in App.tsx
2. **Data Fetching**: Load data in useEffect or use React Router loaders
3. **State Management**: Local useState or connect to Zustand stores
4. **Services**: Call business logic from `@/services/` layer

### Testing

- Test full user workflows end-to-end
- Verify navigation between screens
- Test loading and error states
- Validate data persistence across navigation

### Common Patterns

- **Default Export**: `export default function UploadScreen() {}`
- **Layout**: Use `<div className="container mx-auto p-4">` wrapper
- **Loading States**: Show skeletons or spinners during data fetch
- **Error Boundaries**: Wrap screens in error boundaries

## Dependencies

### Internal
- Components from `@/components/`
- Services from `@/services/`
- Database from `@/db/`
- Types from `@/types/`

### External
- **React Router** - Route params, navigation
- **React 19** - Hooks for state and effects

<!-- MANUAL: -->
