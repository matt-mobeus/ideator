<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Type Definitions

## Purpose

Centralized TypeScript type definitions and interfaces used across the application. Provides type safety for domain models (files, concepts, analyses), network communication, UI components, and worker messages. Ensures consistent data structures and compile-time validation.

## Key Files

| File | Description |
|------|-------------|
| `file.ts` | File upload and processing types |
| `concept.ts` | Extracted concept and cluster types |
| `analysis.ts` | Analysis result and metadata types |
| `network.ts` | HTTP request/response and API types |
| `asset.ts` | Media asset and resource types |
| `queue.ts` | Processing queue and task types |
| `settings.ts` | Application settings and configuration types |
| `visualization.ts` | Data visualization and chart types |
| `index.ts` | Consolidated type exports |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Import Types**: `import { Concept, File } from '@/types'`
2. **Extend Types**: Use `extends` or `&` for type composition
3. **Strict Typing**: Enable strict null checks, avoid `any`
4. **Documentation**: Add JSDoc comments for complex types
5. **Enums**: Use string literal unions instead of enums

### Testing

- Verify types compile without errors
- Test type inference in components and services
- Validate discriminated unions work correctly
- Check for circular type dependencies

### Common Patterns

- **Interface**: `export interface Concept { id: string; text: string; }`
- **Type Alias**: `export type Status = 'pending' | 'processing' | 'complete'`
- **Generics**: `export interface ApiResponse<T> { data: T }`
- **Utility Types**: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`

## Dependencies

### Internal
- No internal dependencies (types are leaf nodes)
- Imported by all other modules

### External
- TypeScript compiler for type checking
- No runtime dependencies

<!-- MANUAL: -->
