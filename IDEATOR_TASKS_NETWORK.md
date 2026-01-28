# IDEATOR — Network Team Task List

**Sprint Planning Document**  
**Reference:** IDEATOR_SPECIFICATION.md

---

## Overview

The network team is responsible for all external API integrations, network abstraction layers, error handling, retry logic, rate limiting, and offline synchronization. This team provides the bridge between the frontend/backend logic and external services.

**Primary Technologies:** TypeScript, Fetch API, OAuth 2.0, WebSocket (optional for real-time)

---

## Task Categories

1. [API Client Abstraction Layer](#1-api-client-abstraction-layer)
2. [LLM API Integration](#2-llm-api-integration)
3. [Web Search Integration](#3-web-search-integration)
4. [Google Drive Integration](#4-google-drive-integration)
5. [Media Processing APIs](#5-media-processing-apis)
6. [Error Handling & Resilience](#6-error-handling--resilience)
7. [Offline Queue Synchronization](#7-offline-queue-synchronization)

---

## 1. API Client Abstraction Layer

### NET-1.0: Base HTTP Client
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** None  
**Blocks:** All other network tasks

**Description:**  
Create a foundational HTTP client wrapper with consistent patterns for all API calls.

**Deliverables:**
- [ ] `HttpClient` class with methods:
  - `get<T>(url, options): Promise<T>`
  - `post<T>(url, body, options): Promise<T>`
  - `put<T>(url, body, options): Promise<T>`
  - `delete<T>(url, options): Promise<T>`
- [ ] Request interceptors (for auth headers, logging)
- [ ] Response interceptors (for error normalization)
- [ ] Timeout configuration (default 30s, configurable)
- [ ] Request cancellation via AbortController
- [ ] Request/response logging (dev mode only)

**Acceptance Criteria:**
- All HTTP methods supported
- Interceptors chainable
- Cancellation works correctly
- TypeScript generics for response typing

---

### NET-1.1: LLM API Client Interface
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** NET-1.0  
**Blocks:** BE-2.2, BE-3.2, BE-4.2, BE-6.1

**Description:**  
Create provider-agnostic LLM API client that can work with multiple providers.

**Deliverables:**
- [ ] `LLMClient` interface:
  ```typescript
  interface LLMClient {
    complete(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
    completeWithSystem(system: string, user: string, options?: LLMOptions): Promise<LLMResponse>;
    streamComplete(prompt: string, options?: LLMOptions): AsyncGenerator<string>;
  }
  
  interface LLMOptions {
    maxTokens?: number;
    temperature?: number;
    model?: string;
    jsonMode?: boolean;
    timeout?: number;
  }
  
  interface LLMResponse {
    content: string;
    usage: { inputTokens: number; outputTokens: number };
    model: string;
    finishReason: 'stop' | 'length' | 'error';
  }
  ```
- [ ] Provider implementations (implement at least 2 for flexibility):
  - OpenAI (GPT-4)
  - Anthropic (Claude)
- [ ] Provider selection via configuration
- [ ] API key management (secure storage)
- [ ] Token counting utilities

**Acceptance Criteria:**
- Interface abstracts provider differences
- At least 2 providers implemented
- Streaming works for real-time feedback
- API keys never logged or exposed

---

## 2. LLM API Integration

### NET-2.0: Prompt Execution Service
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-1.1  
**Blocks:** BE-3.2, BE-4.2

**Description:**  
Service layer for executing LLM prompts with proper handling.

**Deliverables:**
- [ ] `PromptService` class:
  - `execute(prompt: Prompt): Promise<LLMResponse>`
  - `executeWithRetry(prompt: Prompt, retries?: number): Promise<LLMResponse>`
  - `executeBatch(prompts: Prompt[]): Promise<LLMResponse[]>`
- [ ] Prompt templating support (variable interpolation)
- [ ] Response parsing utilities:
  - JSON extraction from markdown code blocks
  - Structured data validation
- [ ] Cost tracking (token usage aggregation)

**Acceptance Criteria:**
- Batch execution parallelizes appropriately
- JSON extraction handles various formats
- Cost tracking accurate

---

### NET-2.1: Web Search Client
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 3 days  
**Dependencies:** NET-1.0  
**Blocks:** BE-4.2, BE-5.2

**Description:**  
Client for real-time web search during market analysis.

**Deliverables:**
- [ ] `WebSearchClient` interface:
  ```typescript
  interface WebSearchClient {
    search(query: string, options?: SearchOptions): Promise<SearchResults>;
  }
  
  interface SearchOptions {
    maxResults?: number;       // default 10
    dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
    domains?: string[];        // whitelist
    excludeDomains?: string[]; // blacklist
  }
  
  interface SearchResults {
    results: SearchResult[];
    totalEstimate: number;
  }
  
  interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    publishedDate?: Date;
    source: string;
  }
  ```
- [ ] Provider implementations (at least 1):
  - Serper API
  - Bing Search API
  - Google Custom Search (if applicable)
- [ ] Result normalization across providers
- [ ] Query sanitization

**Acceptance Criteria:**
- Search returns relevant results
- Results normalized to common format
- Handles empty/error responses gracefully

---

### NET-2.2: Search Result Enrichment
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-2.1  
**Blocks:** BE-4.2

**Description:**  
Fetch and process full page content from search results.

**Deliverables:**
- [ ] `ContentFetcher` service:
  - `fetchPage(url: string): Promise<PageContent>`
  - `fetchPages(urls: string[]): Promise<PageContent[]>`
- [ ] HTML parsing and text extraction
- [ ] Paywall/bot detection (skip unfetchable)
- [ ] Content truncation for LLM context limits
- [ ] Caching layer (avoid re-fetching same URL)

**Acceptance Criteria:**
- Extracts main content (not boilerplate)
- Handles various page structures
- Cache prevents duplicate fetches

---

## 3. Web Search Integration

### NET-3.0: Search Query Builder
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-2.1  
**Blocks:** BE-4.2

**Description:**  
Build optimized search queries for market analysis.

**Deliverables:**
- [ ] Query templates by analysis dimension:
  - Market trends: `"{concept}" market trends 2024 2025`
  - Competition: `"{concept}" competitors startups funding`
  - Technical: `"{concept}" technology implementation`
  - Investment: `"{concept}" venture capital investment funding round`
  - Regulatory: `"{concept}" regulation policy government`
  - Patents: `"{concept}" patent filing USPTO`
- [ ] Query expansion (synonyms, related terms)
- [ ] Query validation (prevent injection)

**Acceptance Criteria:**
- Queries produce relevant results
- Multiple queries per concept for comprehensive coverage

---

### NET-3.1: Search Result Aggregator
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-2.1, NET-2.2, NET-3.0  
**Blocks:** BE-4.2

**Description:**  
Aggregate and rank search results for LLM consumption.

**Deliverables:**
- [ ] `SearchAggregator` service:
  - Execute multiple queries
  - Deduplicate results by URL
  - Rank by relevance and recency
  - Fetch top N full content
  - Package for LLM prompt
- [ ] Source categorization (news, academic, company, government)
- [ ] Recency weighting (prefer recent sources)
- [ ] Output format for LLM context injection

**Acceptance Criteria:**
- Deduplication effective
- Ranking produces sensible order
- Output fits within LLM context window

---

## 4. Google Drive Integration

### NET-4.1: Google OAuth Handler
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** NET-1.0  
**Blocks:** FE-4.3

**Description:**  
Implement Google OAuth 2.0 flow for Drive access.

**Deliverables:**
- [ ] OAuth configuration:
  - Client ID management
  - Redirect URI handling
  - Scope: `https://www.googleapis.com/auth/drive.readonly`
- [ ] `GoogleAuthService`:
  - `initiateAuth(): void` (opens popup)
  - `handleCallback(code: string): Promise<Tokens>`
  - `refreshToken(): Promise<Tokens>`
  - `revokeAccess(): Promise<void>`
- [ ] Token storage (secure, in-memory preferred)
- [ ] Token refresh before expiry
- [ ] Popup/redirect flow handling

**Acceptance Criteria:**
- OAuth flow completes successfully
- Tokens stored securely
- Refresh works before expiry
- User can revoke access

---

### NET-4.2: Google Drive API Client
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** NET-4.1  
**Blocks:** FE-4.3

**Description:**  
Client for Google Drive file operations.

**Deliverables:**
- [ ] `GoogleDriveClient`:
  - `listFolderContents(folderId: string): Promise<DriveFile[]>`
  - `getFileMetadata(fileId: string): Promise<DriveFile>`
  - `downloadFile(fileId: string): Promise<Blob>`
  - `exportGoogleDoc(fileId: string, mimeType: string): Promise<Blob>`
- [ ] File type filtering (only supported formats)
- [ ] Pagination handling for large folders
- [ ] Rate limit handling

**Acceptance Criteria:**
- Lists folder contents correctly
- Downloads all supported file types
- Handles Google Docs export (to PDF/DOCX)
- Rate limits don't cause failures

---

### NET-4.3: Drive Import Orchestrator
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-4.2  
**Blocks:** Backend integration

**Description:**  
Orchestrate the full Drive folder import flow.

**Deliverables:**
- [ ] `DriveImportService`:
  - `importFolder(folderId: string): AsyncGenerator<ImportProgress>`
  - Enumerate all files (recursive into subfolders)
  - Filter to supported formats
  - Download each file
  - Emit progress events
- [ ] Progress tracking:
  - Total file count
  - Current file index
  - Current file name
  - Bytes downloaded
- [ ] Error handling (continue on individual file failures)

**Acceptance Criteria:**
- Imports all supported files from folder
- Progress events accurate
- Individual failures don't stop entire import

---

## 5. Media Processing APIs

### NET-5.1: Audio Transcription Client
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-1.0  
**Blocks:** BE-2.3

**Description:**  
Client for audio/video transcription services.

**Deliverables:**
- [ ] `TranscriptionClient` interface:
  ```typescript
  interface TranscriptionClient {
    transcribe(audio: Blob, options?: TranscriptionOptions): Promise<Transcription>;
    transcribeAsync(audio: Blob, options?: TranscriptionOptions): Promise<TranscriptionJob>;
    getJobStatus(jobId: string): Promise<TranscriptionJob>;
  }
  
  interface Transcription {
    text: string;
    segments: TranscriptionSegment[];
    language: string;
    duration: number;
  }
  
  interface TranscriptionSegment {
    start: number;  // seconds
    end: number;
    text: string;
    confidence: number;
  }
  ```
- [ ] Provider implementations:
  - OpenAI Whisper API
  - AssemblyAI (alternative)
- [ ] Large file handling (chunking if needed)
- [ ] Timestamp alignment

**Acceptance Criteria:**
- Transcription accurate
- Timestamps aligned to audio
- Handles files up to 2 hours

---

### NET-5.2: Vision/OCR Client
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-1.1  
**Blocks:** BE-2.2, BE-2.3

**Description:**  
Client for image analysis and OCR.

**Deliverables:**
- [ ] `VisionClient` interface:
  ```typescript
  interface VisionClient {
    analyzeImage(image: Blob, prompt?: string): Promise<VisionResponse>;
    extractText(image: Blob): Promise<OCRResult>;
  }
  
  interface VisionResponse {
    description: string;
    detectedText?: string[];
    objects?: DetectedObject[];
  }
  
  interface OCRResult {
    text: string;
    blocks: TextBlock[];
    confidence: number;
  }
  ```
- [ ] Provider implementations:
  - OpenAI GPT-4 Vision
  - Google Cloud Vision (OCR)
- [ ] Image preprocessing (resize for API limits)
- [ ] Batch processing support

**Acceptance Criteria:**
- OCR extracts text accurately
- Vision analysis produces useful descriptions
- Handles various image formats

---

### NET-5.3: Video Frame Extractor
**Priority:** P2 (Medium)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-5.2  
**Blocks:** BE-2.3

**Description:**  
Extract and process frames from video files.

**Deliverables:**
- [ ] `VideoFrameService`:
  - `extractFrames(video: Blob, interval: number): AsyncGenerator<Frame>`
  - `extractKeyFrames(video: Blob): Promise<Frame[]>`
- [ ] Frame extraction using browser APIs or ffmpeg.wasm
- [ ] Frame deduplication (skip similar frames)
- [ ] Integration with VisionClient for OCR

**Acceptance Criteria:**
- Frames extracted at configurable interval
- Similar frames filtered out
- Works in browser environment

---

## 6. Error Handling & Resilience

### NET-6.1: Retry Strategy Implementation
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-1.0  
**Blocks:** All API integrations

**Description:**  
Implement robust retry logic for all network operations.

**Deliverables:**
- [ ] `RetryStrategy` class:
  ```typescript
  interface RetryConfig {
    maxRetries: number;           // default 3
    baseDelay: number;            // default 1000ms
    maxDelay: number;             // default 30000ms
    backoffMultiplier: number;    // default 2
    retryableErrors: string[];    // error codes to retry
    onRetry?: (attempt: number, error: Error) => void;
  }
  
  function withRetry<T>(
    fn: () => Promise<T>,
    config?: RetryConfig
  ): Promise<T>;
  ```
- [ ] Exponential backoff with jitter
- [ ] Retryable error classification:
  - 429 (rate limit)
  - 500, 502, 503, 504 (server errors)
  - Network errors (timeout, connection reset)
- [ ] Non-retryable errors:
  - 400 (bad request)
  - 401, 403 (auth errors)
  - 404 (not found)

**Acceptance Criteria:**
- Retry logic handles transient failures
- Backoff prevents thundering herd
- Non-retryable errors fail fast

---

### NET-6.2: Rate Limiter
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-1.0  
**Blocks:** All API integrations

**Description:**  
Implement client-side rate limiting to prevent API throttling.

**Deliverables:**
- [ ] `RateLimiter` class:
  ```typescript
  interface RateLimitConfig {
    requestsPerMinute: number;
    requestsPerDay?: number;
    tokensPerMinute?: number;  // for LLM APIs
  }
  
  class RateLimiter {
    constructor(config: RateLimitConfig);
    acquire(): Promise<void>;  // waits if limit reached
    tryAcquire(): boolean;     // returns false if limit reached
    getWaitTime(): number;     // ms until next available slot
  }
  ```
- [ ] Per-API rate limit configurations:
  - LLM API: based on provider limits
  - Search API: based on provider limits
  - Google Drive: 1000 requests/100 seconds
- [ ] Token bucket algorithm
- [ ] Queue management for waiting requests

**Acceptance Criteria:**
- Rate limits enforced correctly
- Waiting requests queued fairly
- No API throttling errors in normal use

---

### NET-6.3: Circuit Breaker
**Priority:** P1 (High)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-1.0  
**Blocks:** None (enhancement)

**Description:**  
Implement circuit breaker pattern for failing services.

**Deliverables:**
- [ ] `CircuitBreaker` class:
  ```typescript
  interface CircuitBreakerConfig {
    failureThreshold: number;     // failures before opening
    successThreshold: number;     // successes to close
    timeout: number;              // ms before half-open
  }
  
  class CircuitBreaker {
    constructor(config: CircuitBreakerConfig);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    getState(): 'closed' | 'open' | 'half-open';
    onStateChange(callback: (state: string) => void): void;
  }
  ```
- [ ] State machine: closed → open → half-open → closed
- [ ] Failure counting with sliding window
- [ ] Health check during half-open state

**Acceptance Criteria:**
- Circuit opens after threshold failures
- Half-open allows test requests
- Closes after success threshold

---

### NET-6.4: Error Normalization
**Priority:** P0 (Critical Path)  
**Estimated Effort:** 1 day  
**Dependencies:** NET-1.0  
**Blocks:** All API integrations

**Description:**  
Normalize errors from all APIs to consistent format.

**Deliverables:**
- [ ] `NetworkError` class hierarchy:
  ```typescript
  class NetworkError extends Error {
    code: string;
    statusCode?: number;
    retryable: boolean;
    provider: string;
    originalError?: Error;
  }
  
  class RateLimitError extends NetworkError { retryAfter: number; }
  class AuthenticationError extends NetworkError {}
  class TimeoutError extends NetworkError {}
  class ProviderError extends NetworkError {}
  ```
- [ ] Error mapping from each provider format
- [ ] User-friendly error messages
- [ ] Error logging (sanitized, no sensitive data)

**Acceptance Criteria:**
- All API errors normalized
- Error messages actionable
- Sensitive data never logged

---

## 7. Offline Queue Synchronization

### NET-7.1: Request Queue
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** NET-1.0, BE-1.3 (storage)  
**Blocks:** Offline functionality

**Description:**  
Queue network requests when offline for later execution.

**Deliverables:**
- [ ] `RequestQueue` class:
  ```typescript
  interface QueuedRequest {
    id: string;
    type: 'file_upload' | 'analysis' | 'asset_generation';
    payload: any;
    createdAt: Date;
    attempts: number;
    lastError?: string;
  }
  
  class RequestQueue {
    enqueue(request: QueuedRequest): Promise<void>;
    dequeue(): Promise<QueuedRequest | null>;
    peek(): Promise<QueuedRequest | null>;
    remove(id: string): Promise<void>;
    getAll(): Promise<QueuedRequest[]>;
    clear(): Promise<void>;
  }
  ```
- [ ] IndexedDB persistence (via Backend storage)
- [ ] Priority ordering (FIFO default)
- [ ] Duplicate detection

**Acceptance Criteria:**
- Queue persists across sessions
- Duplicates prevented
- Order maintained

---

### NET-7.2: Sync Manager
**Priority:** P1 (High)  
**Estimated Effort:** 3 days  
**Dependencies:** NET-7.1, NET-6.1  
**Blocks:** Offline functionality

**Description:**  
Manage synchronization when connectivity restored.

**Deliverables:**
- [ ] `SyncManager` class:
  - `startSync(): void`
  - `stopSync(): void`
  - `getSyncStatus(): SyncStatus`
  - `onSyncProgress(callback): void`
  - `onSyncComplete(callback): void`
  - `onSyncError(callback): void`
- [ ] Online/offline detection (navigator.onLine + fetch probe)
- [ ] Automatic sync trigger on reconnection
- [ ] Sequential processing (one at a time)
- [ ] Failure handling (retry with backoff, eventually skip)
- [ ] Progress events for UI

**Acceptance Criteria:**
- Sync starts automatically on reconnect
- Progress accurately reported
- Failed items don't block queue

---

### NET-7.3: Conflict Resolution
**Priority:** P2 (Medium)  
**Estimated Effort:** 2 days  
**Dependencies:** NET-7.2  
**Blocks:** None

**Description:**  
Handle conflicts when syncing queued requests.

**Deliverables:**
- [ ] Conflict detection:
  - File already processed
  - Concept already analyzed
  - Data changed since queue
- [ ] Resolution strategies:
  - Skip (already done)
  - Overwrite (re-process)
  - Merge (combine results)
- [ ] User notification of conflicts
- [ ] Conflict log for debugging

**Acceptance Criteria:**
- Conflicts detected correctly
- Resolution doesn't lose data
- User informed of skipped items

---

## Dependency Graph

```
NET-1.0 ──┬──▶ NET-1.1 ──▶ NET-2.0 ──▶ BE-3.2, BE-4.2, BE-6.1
          │       │
          │       └──────────────────▶ NET-5.2 ──▶ NET-5.3 ──▶ BE-2.3
          │
          ├──▶ NET-2.1 ──▶ NET-2.2 ──┬──▶ NET-3.0 ──▶ NET-3.1 ──▶ BE-4.2
          │                          │
          │                          └──▶ BE-5.2
          │
          ├──▶ NET-4.1 ──▶ NET-4.2 ──▶ NET-4.3 ──▶ FE-4.3
          │
          ├──▶ NET-5.1 ──▶ BE-2.3
          │
          ├──▶ NET-6.1 ──┬──▶ All API clients
          │              │
          ├──▶ NET-6.2 ──┤
          │              │
          ├──▶ NET-6.4 ──┘
          │
          └──▶ NET-6.3 (enhancement, parallel track)

NET-7.1 ──▶ NET-7.2 ──▶ NET-7.3

External Dependencies:
- NET-7.1 requires BE-1.3 (storage service) for IndexedDB persistence
```

---

## API Provider Recommendations

### LLM Providers (NET-1.1)

| Provider | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| OpenAI (GPT-4) | Best-in-class, reliable | Expensive, rate limits | Primary |
| Anthropic (Claude) | Strong reasoning, large context | Newer, less tooling | Secondary |
| Google (Gemini) | Multimodal native | Variable quality | Optional |

**Recommendation:** Implement OpenAI as primary, Anthropic as fallback.

### Search Providers (NET-2.1)

| Provider | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| Serper | Cheap, fast, good quality | Limited features | Primary |
| Bing Search | Microsoft backing, generous limits | Setup complexity | Secondary |
| Google CSE | Best results | Expensive, quotas | Optional |

**Recommendation:** Implement Serper as primary.

### Transcription Providers (NET-5.1)

| Provider | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| OpenAI Whisper | Excellent quality, good price | 25MB file limit | Primary |
| AssemblyAI | Large files, real-time | More expensive | Secondary |

**Recommendation:** Implement Whisper, with chunking for large files.

### Vision/OCR Providers (NET-5.2)

| Provider | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| OpenAI GPT-4V | Excellent understanding | Expensive | Analysis |
| Google Cloud Vision | Fast, cheap OCR | Limited understanding | OCR |

**Recommendation:** Use Google Cloud Vision for pure OCR, GPT-4V for analysis.

---

## Sprint Recommendations

### Sprint 1 (Foundation)
- NET-1.0
- NET-1.1 (OpenAI provider only)
- NET-6.1, NET-6.2, NET-6.4

### Sprint 2 (Core APIs)
- NET-2.0
- NET-2.1, NET-2.2
- NET-3.0, NET-3.1

### Sprint 3 (Media & Drive)
- NET-4.1, NET-4.2, NET-4.3
- NET-5.1, NET-5.2

### Sprint 4 (Resilience & Offline)
- NET-1.1 (Anthropic provider)
- NET-5.3
- NET-6.3
- NET-7.1, NET-7.2, NET-7.3

---

## Configuration Management

### Environment Variables Required

```
# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Search Provider
SERPER_API_KEY=...

# Google APIs
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CLOUD_VISION_KEY=...

# Optional
ASSEMBLYAI_API_KEY=...
```

### Runtime Configuration Schema

```typescript
interface NetworkConfig {
  llm: {
    provider: 'openai' | 'anthropic';
    model: string;
    maxTokens: number;
    temperature: number;
  };
  search: {
    provider: 'serper' | 'bing';
    maxResults: number;
  };
  rateLimits: {
    llmRequestsPerMinute: number;
    searchRequestsPerMinute: number;
    driveRequestsPerMinute: number;
  };
  retry: {
    maxRetries: number;
    baseDelay: number;
  };
  offline: {
    syncOnReconnect: boolean;
    maxQueueSize: number;
  };
}
```

---

## Security Considerations

### API Key Management
- [ ] Never commit API keys to repository
- [ ] Use environment variables in development
- [ ] Consider key encryption at rest
- [ ] Implement key rotation support
- [ ] Log API usage (not keys) for monitoring

### Data in Transit
- [ ] All API calls over HTTPS
- [ ] Certificate validation enabled
- [ ] No sensitive data in URL parameters
- [ ] Request/response sanitization in logs

### OAuth Security
- [ ] Use PKCE for OAuth flows
- [ ] Validate state parameter
- [ ] Short-lived access tokens
- [ ] Secure token storage

---

## Notes for Network Team

1. **Provider abstraction is critical** — Backend should never know which provider is used
2. **Retry logic saves money** — Transient failures are common, don't re-prompt unnecessarily
3. **Rate limits are real** — Implement client-side limiting before hitting API limits
4. **Offline-first mindset** — Assume network will fail, design for resilience
5. **Monitor costs** — LLM APIs are expensive, track token usage
6. **Coordinate with Backend** — Your interfaces are their dependencies
7. **Test with real APIs** — Mocks don't catch rate limits and edge cases

---

## Blockers & Cross-Team Dependencies

### Network → Backend Blockers

| Network Task | Blocks Backend Task | Description |
|--------------|---------------------|-------------|
| NET-1.1 | BE-2.2, BE-3.2, BE-4.2, BE-6.1 | LLM client needed for all AI processing |
| NET-2.1 | BE-4.2, BE-5.2 | Web search needed for market analysis |
| NET-5.1 | BE-2.3 | Transcription needed for multimedia |
| NET-5.2 | BE-2.2, BE-2.3 | Vision/OCR needed for document/video processing |

### Network → Frontend Blockers

| Network Task | Blocks Frontend Task | Description |
|--------------|----------------------|-------------|
| NET-4.1 | FE-4.3 | Google OAuth needed for Drive folder linking |

### Backend → Network Dependencies

| Backend Task | Network Task Depends On | Description |
|--------------|-------------------------|-------------|
| BE-1.3 | NET-7.1 | Storage service needed for request queue persistence |

---

**END OF NETWORK TASK LIST**
