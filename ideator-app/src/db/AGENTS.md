<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Database Layer

## Purpose

Client-side IndexedDB database using Dexie wrapper for persistent storage. Manages schema for files, concepts, analyses, and other application data. Provides typed access layer with transactions, queries, and migrations. Enables offline-first functionality with local data persistence.

## Key Files

| File | Description |
|------|-------------|
| `database.ts` | Dexie database schema definition and initialization |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Import**: `import { db } from '@/db/database'`
2. **Operations**: `await db.files.add(fileData)`, `await db.concepts.where('id').equals(id).first()`
3. **Schema Changes**: Increment version number, add migration logic
4. **Transactions**: Use `db.transaction()` for atomic multi-table operations

### Testing

- Test in browser DevTools → Application → IndexedDB
- Verify schema migrations by changing version
- Test offline behavior by disabling network
- Clear database: `await db.delete()` in console

### Common Patterns

- **Table Access**: `db.tableName.method()`
- **Queries**: `.where('field').equals(value)`, `.filter()`, `.toArray()`
- **Bulk Operations**: `.bulkAdd()`, `.bulkPut()` for performance
- **Error Handling**: Wrap in try-catch, Dexie throws on constraint violations

## Dependencies

### Internal
- Types from `@/types/` for table schemas
- Used by `@/services/storage.service.ts` for CRUD operations

### External
- **Dexie 4.2** - IndexedDB wrapper with typed API

<!-- MANUAL: -->
