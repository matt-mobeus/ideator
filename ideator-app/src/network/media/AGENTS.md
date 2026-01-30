<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Media Processing

## Purpose

Handles external API calls for media analysis including video transcription, frame extraction, and vision-based image analysis. Provides interfaces to services like speech-to-text APIs, video processing platforms, and multimodal LLMs for extracting meaningful content from multimedia files.

## Key Files

| File | Description |
|------|-------------|
| `transcription.ts` | Audio/video transcription API client |
| `video-frames.ts` | Video frame extraction and sampling |
| `vision.ts` | Image analysis via vision APIs |
| `index.ts` | Public exports for media processing |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Transcription**: Send audio/video files to transcription services
2. **Frame Extraction**: Extract keyframes from videos at specified intervals
3. **Vision Analysis**: Analyze images using multimodal LLMs
4. **Error Handling**: Handle large file uploads and processing timeouts

### Testing

- Test with small sample files (audio, video, image)
- Verify timeout handling for large files
- Test error cases (unsupported formats, API failures)
- Validate response parsing

### Common Patterns

- **Async Processing**: All media operations are async with progress callbacks
- **Format Detection**: Validate file types before API calls
- **Chunking**: Large files may need to be processed in chunks
- **Result Caching**: Cache results to avoid redundant API calls

## Dependencies

### Internal
- HTTP client from `@/network/http-client.ts`
- Resilience patterns from `@/network/resilience/`
- File type detection from `@/services/format-detector.ts`

### External
- External transcription APIs (e.g., Whisper, speech-to-text services)
- Vision APIs (e.g., GPT-4 Vision, Claude with vision)

<!-- MANUAL: -->
