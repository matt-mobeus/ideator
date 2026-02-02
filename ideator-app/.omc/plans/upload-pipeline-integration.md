# Plan: Upload-to-Pipeline Integration

## Context

### Original Request
Connect the upload screen to the pipeline orchestrator. After file processing completes, build a task graph, start the pipeline, and navigate to the concepts screen.

### Current Bug
- `UploadScreen.tsx` processes files via `processFileWithProgress()` which returns extracted text
- The returned text is **discarded** (line 70-81: `await processFileWithProgress(...)` result unused)
- After 2-second timeout (line 112-116), state resets and user stays on upload screen
- Pipeline orchestrator exists at `src/services/pipeline/orchestrator.ts` but is never invoked
- ConceptsScreen is hardcoded to mock data (`const [useMock] = useState(true)`)

### Architecture Summary
- **`processFileWithProgress()`** returns `Promise<string>` (extracted text)
- **`buildTaskGraph(files, options)`** takes `FileInput[]` (blob, name, format) and `PipelineOptions`
- **`PipelineOrchestrator(plan, llmConfig, store)`** runs the DAG; subscribable via `.subscribe()`
- **`pipelineStore`** singleton from `store.ts` for IndexedDB persistence
- **Settings** stored in Dexie `db.settings` table as `AppSettings` with `id: 'app-settings'`
- **Database import**: `import { db } from '@/db/database.ts'` (confirmed from storage.service.ts, job-queue.service.ts, SettingsModal.tsx)
- **Routing**: `/analyze/:id` requires a concept ID param; `/concepts` shows concept list
- **ConceptsScreen**: Uses `MOCK_CONCEPTS`/`MOCK_CLUSTERS` when `useMock === true` (always true currently)

## Work Objectives

### Core Objective
Wire the upload completion flow into the pipeline orchestrator so extracted files flow through the full analysis pipeline, and make ConceptsScreen display real pipeline results.

### Deliverables
1. UploadScreen captures file blobs and passes them to `buildTaskGraph()`
2. Pipeline orchestrator starts running after graph is built
3. App navigates to `/concepts` after starting
4. ConceptsScreen reads pipeline state and shows real concepts when available

### Definition of Done
- Uploading files triggers the full pipeline (text-extraction -> concept-extraction -> clustering -> optional outputs)
- User sees pipeline progress on concepts screen
- Real concepts replace mocks when pipeline completes
- No regressions in upload flow
- Errors during pipeline startup show user feedback

## Must Have
- Collect file Blobs from queued files for `buildTaskGraph()`
- Load LlmConfig from Dexie settings using `import { db } from '@/db/database.ts'`
- Navigate after pipeline starts (not after it completes)
- ConceptsScreen checks for active pipeline and shows real data
- Pipeline errors should not crash the app

## Must NOT Have
- New state management abstractions (no new context/store)
- Changes to pipeline orchestrator internals
- Changes to graph-builder internals
- New routes (reuse existing)

---

## Task Flow

```
[Task 1: UploadScreen] --> [Task 2: ConceptsScreen Pipeline Awareness] --> [Task 3: Verify]
```

---

## Tasks

### Task 1: Modify UploadScreen to capture results and start pipeline
**File:** `src/screens/upload/UploadScreen.tsx`
**Acceptance:** After all files process, pipeline starts and app navigates to `/concepts`.

**Changes:**

1. **Add imports** (top of file):
```typescript
import { useNavigate } from 'react-router-dom'
import { buildTaskGraph } from '@/services/pipeline/graph-builder'
import { PipelineOrchestrator } from '@/services/pipeline/orchestrator'
import { pipelineStore } from '@/services/pipeline/store'
import { db } from '@/db/database.ts'
import type { FileFormat } from '@/types/file'
```

2. **Add `useNavigate` hook** inside component (line ~28):
```typescript
const navigate = useNavigate()
```

3. **Track per-file results** -- add a `results` array before `processingPromises`:
```typescript
const results: (string | null)[] = new Array(queuedFiles.length).fill(null)
```
Then in the try block of each file's processing (line 70), capture the return:
```typescript
const text = await processFileWithProgress(...)
results[index] = text
```

4. **Replace the setTimeout cleanup block** (lines 112-116) with pipeline startup logic:

```typescript
// Collect successful file inputs for the pipeline
const fileInputs = queuedFiles
  .filter((_, index) => results[index] !== null)
  .map((qf) => ({
    blob: qf.file as Blob,
    name: qf.name,
    format: qf.format as FileFormat,
  }))

if (fileInputs.length === 0) {
  // All files failed -- reset and stay on upload
  setIsProcessing(false)
  setQueuedFiles([])
  setJobs([])
  return
}

try {
  // Load LLM settings from Dexie
  const settings = await db.settings.get('app-settings')
  if (!settings?.llm?.apiKey) {
    logger.error('No LLM API key configured', { context: 'upload-screen' })
    // TODO: Show toast/notification to user
    setIsProcessing(false)
    return
  }

  // Build task graph
  const plan = buildTaskGraph(fileInputs, {
    domain: undefined,
    generateDocument: true,
    generateVisual: true,
    trackProvenance: true,
    generateTimeline: true,
    generateNodeMap: true,
  })

  // Create orchestrator and start pipeline (fire-and-forget)
  const orchestrator = new PipelineOrchestrator(plan, settings.llm, pipelineStore)

  const planId = plan.id

  // Persist plan ID so ConceptsScreen can track progress
  sessionStorage.setItem('active-pipeline-id', planId)

  // Start pipeline in background (don't await)
  orchestrator.run().catch((err) => {
    logger.error('Pipeline execution failed', {
      context: 'upload-screen',
      data: { planId, error: String(err) },
    })
  })

  // Navigate to concepts screen (pipeline runs in background)
  navigate('/concepts')
} catch (err) {
  logger.error('Failed to start pipeline', {
    context: 'upload-screen',
    data: { error: String(err) },
  })
} finally {
  setIsProcessing(false)
  setQueuedFiles([])
  setJobs([])
}
```

### Task 2: Make ConceptsScreen pipeline-aware
**File:** `src/screens/concepts/ConceptsScreen.tsx`
**Acceptance:** Shows real concepts from pipeline when available; shows pipeline progress indicator; falls back to mocks only when no active pipeline.

**Changes:**

1. **Add imports:**
```typescript
import { pipelineStore } from '@/services/pipeline/store'
import type { PipelinePlan } from '@/services/pipeline/types'
```

2. **Replace `const [useMock] = useState(true)` with pipeline-aware state:**
```typescript
const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
const [pipelineConcepts, setPipelineConcepts] = useState<Concept[] | null>(null)
```

3. **Add useEffect to check for active pipeline on mount:**
```typescript
useEffect(() => {
  const pipelineId = sessionStorage.getItem('active-pipeline-id')
  if (!pipelineId) return

  let cancelled = false

  const pollPipeline = async () => {
    try {
      const plan = await pipelineStore.load(pipelineId)
      if (cancelled || !plan) return

      // Check concept-extraction task status
      const conceptTask = Object.values(plan.tasks).find(t => t.type === 'concept-extraction')
      if (!conceptTask) return

      if (conceptTask.status === 'completed' && conceptTask.output?.concepts) {
        setPipelineConcepts(conceptTask.output.concepts as Concept[])
        setPipelineState('done')
        return // Stop polling
      }

      if (conceptTask.status === 'failed') {
        setPipelineState('error')
        return // Stop polling
      }

      // Still running -- poll again
      setPipelineState('running')
      setTimeout(pollPipeline, 2000)
    } catch {
      setPipelineState('error')
    }
  }

  pollPipeline()
  return () => { cancelled = true }
}, [])
```

4. **Update concepts data source:**
```typescript
// Use pipeline concepts if available, otherwise fall back to mocks
const concepts: Concept[] = pipelineConcepts ?? MOCK_CONCEPTS
const clusters: Cluster[] = pipelineConcepts ? [] : MOCK_CLUSTERS
// Note: clusters from pipeline would come from clustering task; for now show empty if real data
```

5. **Add pipeline status indicator in JSX** (above the filter panel or concept list):
```typescript
{pipelineState === 'running' && (
  <div className="...pipeline-indicator...">
    Pipeline running... Concepts will appear when extraction completes.
  </div>
)}
{pipelineState === 'error' && (
  <div className="...error-indicator...">
    Pipeline encountered an error. Showing sample data.
  </div>
)}
```

### Task 3: Verify route exists
**File:** `src/App.tsx`
**Acceptance:** Route `/concepts` exists and is reachable.

**Analysis:** Route already exists at line 31: `<Route path="/concepts" element={...}>`. No changes needed. Verify only.

---

## Commit Strategy

### Single commit:
```
feat: wire upload completion to pipeline orchestrator

After file processing completes in UploadScreen, collected file blobs
are passed to buildTaskGraph() to create an execution plan. A
PipelineOrchestrator instance is created with the user's LLM config
from Dexie settings and starts running in the background. The app
navigates to /concepts after pipeline launch.

ConceptsScreen now checks sessionStorage for an active pipeline ID,
polls pipelineStore for progress, and displays real concepts when
the concept-extraction task completes. Falls back to mock data when
no active pipeline exists.
```

## Verification

### Build check
```bash
cd /Users/mts/ideator/ideator-app && npm run build
```
**Expected:** Zero errors, zero warnings related to changed files.

### Manual test steps
1. Open app in browser, configure LLM API key in Settings
2. Navigate to Upload screen
3. Drop 1-2 PDF/text files into the drop zone
4. Click "Begin Ingestion" (or equivalent start button)
5. **Verify:** Files process (progress bars advance)
6. **Verify:** After processing completes, app navigates to `/concepts`
7. **Verify:** ConceptsScreen shows "Pipeline running..." indicator
8. **Verify:** After pipeline completes, real concepts appear (or mock data if pipeline errors)
9. Open browser DevTools Console -- **Verify:** No uncaught errors, no crash

### Console checks
- No `TypeError` or `ReferenceError` in console
- Logger messages appear: `[upload-screen]` context entries for pipeline start
- If no API key: error log says "No LLM API key configured"

## Success Criteria
- [ ] Upload files -> text extraction runs -> pipeline starts automatically
- [ ] App navigates to /concepts after pipeline starts
- [ ] Pipeline runs in background (not blocking UI)
- [ ] ConceptsScreen shows "Pipeline running..." while tasks execute
- [ ] ConceptsScreen shows real concepts when concept-extraction completes
- [ ] ConceptsScreen falls back to mock data when no active pipeline
- [ ] Missing API key shows error log (doesn't crash)
- [ ] Failed file processing doesn't prevent pipeline from starting with successful files
- [ ] `npm run build` produces zero errors
- [ ] No new abstractions introduced
- [ ] db imported from `@/db/database.ts` (not `@/db` or other path)
