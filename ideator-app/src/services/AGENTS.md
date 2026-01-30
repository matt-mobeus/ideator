<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Business Logic Services

## Purpose

Core business logic layer containing domain services for file processing, concept extraction, clustering, search indexing, and data validation. Orchestrates interactions between network APIs, database operations, and web workers. Implements the application's primary workflows and algorithms independent of UI presentation.

## Key Files

| File | Description |
|------|-------------|
| `file-processing.service.ts` | Orchestrates file upload, parsing, and content extraction |
| `concept-extraction.service.ts` | Extracts concepts from processed file content using LLMs |
| `clustering.service.ts` | Clusters concepts into semantic groups |
| `search-index.service.ts` | Builds and maintains search index for fast querying |
| `validity-scorer.ts` | Scores and validates concept quality and relevance |
| `prompt-builder.ts` | Constructs LLM prompts for various operations |
| `format-detector.ts` | Detects file formats and content types |
| `storage.service.ts` | Abstracts database operations for services |
| `index.ts` | Public service exports |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Service Layer**: Business logic only, no UI concerns
2. **Composition**: Services can call other services and network layer
3. **Stateless**: Services are pure functions, state in database/stores
4. **Error Propagation**: Let errors bubble up with context

### Testing

- Unit test services with mocked dependencies
- Test workflows end-to-end with real database
- Verify worker communication in service orchestration
- Test error handling and recovery

### Common Patterns

- **Service Functions**: `export async function processFile(file: File): Promise<Result>`
- **Dependency Injection**: Pass dependencies as parameters
- **Result Objects**: Return `{ success, data?, error? }` objects
- **Worker Delegation**: Offload heavy processing to web workers

## Dependencies

### Internal
- Database operations via `@/db/database`
- Network calls via `@/network/` layer
- Web workers via `@/workers/`
- Types from `@/types/`

### External
- **Fuse.js** - Fuzzy search library
- **uuid** - Unique ID generation
- **file-saver** - File download utilities

<!-- MANUAL: -->
