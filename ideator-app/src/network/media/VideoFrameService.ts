// ============================================================================
// IDEATOR — Video Frame Extractor (NET-5.3)
// Extracts and processes frames from video files
// ============================================================================

/** A single extracted video frame */
export interface VideoFrame {
  /** Frame index */
  index: number;
  /** Timestamp in seconds */
  timestamp: number;
  /** Frame image as blob */
  blob: Blob;
  /** Frame dimensions */
  width: number;
  height: number;
}

export class VideoFrameService {
  /**
   * Extract frames from a video at regular intervals.
   * @param video - Video blob
   * @param intervalSeconds - Seconds between frame captures (default 1)
   */
  async *extractFrames(
    _video: Blob,
    _intervalSeconds?: number
  ): AsyncGenerator<VideoFrame> {
    // TODO: Use HTMLVideoElement + canvas to extract frames in browser
    // TODO: Or use ffmpeg.wasm for more robust extraction
    throw new Error('VideoFrameService.extractFrames not yet implemented');
  }

  /**
   * Extract only key frames (scene changes).
   */
  async extractKeyFrames(_video: Blob): Promise<VideoFrame[]> {
    // TODO: Detect scene changes by comparing frame similarity
    throw new Error('VideoFrameService.extractKeyFrames not yet implemented');
  }
}
