<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Upload Screen

## Purpose

File upload interface allowing drag-and-drop or click-to-upload functionality with queue management and ingestion progress tracking. Handles multiple file types (PDF, DOCX, XLSX, CSV, images, videos), validates formats, queues files for processing, and displays real-time progress. Integrates with file processing service and web workers.

## Key Files

| File | Description |
|------|-------------|
| `UploadScreen.tsx` | Main screen component with layout and orchestration |
| `DropZone.tsx` | Drag-and-drop upload area with file validation |
| `UploadQueue.tsx` | Queue display showing pending and processing files |
| `IngestionProgress.tsx` | Real-time progress indicator for file processing |
| `index.ts` | Screen export |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **File Upload**: Handle drag-drop and file input events
2. **Validation**: Check file types, sizes before adding to queue
3. **Queue Management**: Track pending, processing, completed files
4. **Progress**: Update UI with worker progress messages
5. **Navigation**: Redirect to concepts screen after successful processing

### Testing

- Test drag-and-drop with multiple files
- Verify file type validation (accept/reject)
- Test queue operations (add, remove, clear)
- Verify progress updates from workers
- Test error handling (large files, unsupported formats)

### Common Patterns

- **File Input**: `<input type="file" multiple accept=".pdf,.docx,..." />`
- **Drag Events**: `onDrop`, `onDragOver`, `onDragLeave`
- **Worker Communication**: postMessage to workers, listen for progress
- **Queue State**: useState with array of file objects

## Dependencies

### Internal
- Components from `@/components/ui` and `@/components/composites`
- File processing service from `@/services/file-processing.service`
- Workers from `@/workers/`
- Types from `@/types/file.ts`

### External
- **React 19** - Hooks and state management
- **React Router** - Navigation to next screen

<!-- MANUAL: -->
