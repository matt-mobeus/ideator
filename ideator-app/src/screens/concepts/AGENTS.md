<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Concepts Screen

## Purpose

Displays extracted concepts organized into semantic clusters with filtering, search, and visualization capabilities. Shows concept cards with validity scores, allows filtering by source files and validity thresholds, and provides cluster-based organization. Primary screen for reviewing and exploring LLM-extracted concepts from uploaded documents.

## Key Files

| File | Description |
|------|-------------|
| `ConceptsScreen.tsx` | Main screen with layout, data loading, and state management |
| `ConceptCard.tsx` | Individual concept display with metadata and actions |
| `ClusterContainer.tsx` | Container for grouped concepts by cluster |
| `FilterPanel.tsx` | Sidebar with filters for files, validity, search |
| `index.ts` | Screen export |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Data Loading**: Fetch concepts and files from database on mount
2. **Clustering**: Group concepts by cluster ID from clustering service
3. **Filtering**: Apply file, validity, and search filters to displayed concepts
4. **Search**: Real-time search across concept text and metadata
5. **Actions**: Export, delete, or navigate to concept details

### Testing

- Test concept loading from database
- Verify cluster grouping logic
- Test filter combinations (file + validity + search)
- Verify search functionality with fuzzy matching
- Test export functionality

### Common Patterns

- **Data Fetching**: `useEffect(() => { loadConcepts() }, [])`
- **Filter State**: Multiple useState hooks or single filter object
- **Computed Values**: useMemo for filtered/clustered results
- **Search**: Debounced search input with Fuse.js

## Dependencies

### Internal
- Components from `@/components/`
- Services: clustering, search-index, storage
- Database from `@/db/`
- Types from `@/types/concept.ts`

### External
- **React 19** - Hooks and memoization
- **Fuse.js** - Fuzzy search

<!-- MANUAL: -->
