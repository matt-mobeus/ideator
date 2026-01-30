<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Web Workers

## Purpose

Background processing threads for CPU-intensive file parsing and content extraction. Handles PDF, DOCX, XLSX, CSV, image, and video processing without blocking the main thread. Workers receive files via postMessage, process them using specialized libraries, and return structured content for storage and analysis.

## Key Files

| File | Description |
|------|-------------|
| `file-processing.worker.ts` | Main worker coordinator dispatching to specialized processors |
| `text-processor.ts` | Plain text file processing |
| `structured-processor.ts` | XLSX, CSV structured data processing |
| `multimedia-processor.ts` | Image and video processing coordinator |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Worker Creation**: `new Worker(new URL('./worker.ts', import.meta.url))`
2. **Message Protocol**: Typed messages with `{ type, payload }` structure
3. **Progress Updates**: Send intermediate progress messages
4. **Error Handling**: Catch errors and send error messages
5. **Termination**: Clean up resources, terminate when done

### Testing

- Test worker creation and termination
- Verify message passing (send/receive)
- Test with sample files of each type
- Validate progress reporting
- Test error handling with malformed files

### Common Patterns

- **Message Handler**: `self.onmessage = (e) => { processMessage(e.data) }`
- **Progress**: `self.postMessage({ type: 'progress', percent: 50 })`
- **Result**: `self.postMessage({ type: 'complete', data: result })`
- **Error**: `self.postMessage({ type: 'error', error: message })`

## Dependencies

### Internal
- Types from `@/types/` for message interfaces
- Shared utilities (if any)

### External
- **pdfjs-dist** - PDF parsing
- **mammoth** - DOCX parsing
- **xlsx** - Excel file parsing
- **papaparse** - CSV parsing

<!-- MANUAL: -->
