<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Search Services

## Purpose

Provides external search capabilities including web search, semantic search, and search result enrichment. Integrates with search APIs for discovering related information, aggregating results from multiple sources, and enhancing user queries with context. Supports both keyword and semantic search paradigms.

## Key Files

| File | Description |
|------|-------------|
| `web-search-client.ts` | Web search API client (Google, Bing, etc.) |
| `query-builder.ts` | Search query construction and optimization |
| `enrichment.ts` | Result enrichment with metadata and snippets |
| `aggregator.ts` | Multi-source search result aggregation |
| `index.ts` | Public exports for search services |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Query Building**: Construct optimized search queries from user input
2. **Result Aggregation**: Combine results from multiple search providers
3. **Enrichment**: Add metadata, snippets, and context to results
4. **Rate Limiting**: Respect search API quotas

### Testing

- Test query construction with various inputs
- Verify result parsing from different providers
- Test aggregation with overlapping results
- Validate enrichment metadata accuracy

### Common Patterns

- **Query Optimization**: Improve search quality with query rewriting
- **Result Deduplication**: Merge duplicate results from different sources
- **Ranking**: Apply relevance scoring to aggregated results
- **Caching**: Cache search results to reduce API calls

## Dependencies

### Internal
- HTTP client from `@/network/http-client.ts`
- Resilience patterns for retry logic
- Types from `@/types/`

### External
- Search API providers (Google Custom Search, Bing, etc.)
- No search library dependencies (direct API integration)

<!-- MANUAL: -->
