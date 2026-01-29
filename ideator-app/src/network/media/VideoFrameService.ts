// ============================================================================
// IDEATOR — Video Frame Extractor (NET-5.3)
// Extracts and processes frames from video files using canvas APIs
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
  private maxWidth = 1280;
  private maxHeight = 720;

  /**
   * Extract frames from a video at regular intervals.
   * @param video - Video blob
   * @param intervalSeconds - Seconds between frame captures (default 1)
   */
  async *extractFrames(video: Blob, intervalSeconds = 1): AsyncGenerator<VideoFrame> {
    const videoEl = await this.createVideoElement(video);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const { drawWidth, drawHeight } = this.computeDimensions(videoEl.videoWidth, videoEl.videoHeight);
    canvas.width = drawWidth;
    canvas.height = drawHeight;

    const duration = videoEl.duration;
    let index = 0;

    for (let t = 0; t < duration; t += intervalSeconds) {
      await this.seekTo(videoEl, t);
      ctx.drawImage(videoEl, 0, 0, drawWidth, drawHeight);

      const blob = await this.canvasToBlob(canvas);
      yield {
        index: index++,
        timestamp: t,
        blob,
        width: drawWidth,
        height: drawHeight,
      };
    }

    URL.revokeObjectURL(videoEl.src);
  }

  /**
   * Extract key frames by sampling at wider intervals and comparing for scene changes.
   * Uses a simple pixel-difference heuristic.
   */
  async extractKeyFrames(video: Blob): Promise<VideoFrame[]> {
    const videoEl = await this.createVideoElement(video);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const { drawWidth, drawHeight } = this.computeDimensions(videoEl.videoWidth, videoEl.videoHeight);
    canvas.width = drawWidth;
    canvas.height = drawHeight;

    const duration = videoEl.duration;
    const sampleInterval = Math.max(0.5, duration / 100);
    const keyFrames: VideoFrame[] = [];
    let prevData: Uint8ClampedArray | null = null;
    let index = 0;
    const threshold = 0.15;

    for (let t = 0; t < duration; t += sampleInterval) {
      await this.seekTo(videoEl, t);
      ctx.drawImage(videoEl, 0, 0, drawWidth, drawHeight);

      const imageData = ctx.getImageData(0, 0, drawWidth, drawHeight);
      const currData = imageData.data;

      if (!prevData || this.frameDifference(prevData, currData) > threshold) {
        const blob = await this.canvasToBlob(canvas);
        keyFrames.push({
          index: index++,
          timestamp: t,
          blob,
          width: drawWidth,
          height: drawHeight,
        });
      }

      prevData = new Uint8ClampedArray(currData);
    }

    URL.revokeObjectURL(videoEl.src);
    return keyFrames;
  }

  private createVideoElement(video: Blob): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const el = document.createElement('video');
      el.muted = true;
      el.preload = 'auto';
      el.src = URL.createObjectURL(video);
      el.onloadedmetadata = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to load video'));
    });
  }

  private seekTo(video: HTMLVideoElement, time: number): Promise<void> {
    return new Promise((resolve) => {
      video.currentTime = time;
      video.onseeked = () => resolve();
    });
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/jpeg',
        0.8
      );
    });
  }

  private computeDimensions(srcW: number, srcH: number): { drawWidth: number; drawHeight: number } {
    const scale = Math.min(1, this.maxWidth / srcW, this.maxHeight / srcH);
    return {
      drawWidth: Math.round(srcW * scale),
      drawHeight: Math.round(srcH * scale),
    };
  }

  /** Compute normalized pixel difference between two RGBA data arrays */
  private frameDifference(a: Uint8ClampedArray, b: Uint8ClampedArray): number {
    let diff = 0;
    const len = Math.min(a.length, b.length);
    // Sample every 16th pixel for performance (skip alpha channel)
    for (let i = 0; i < len; i += 64) {
      diff += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    }
    const samples = Math.floor(len / 64);
    return diff / (samples * 765); // 765 = 255 * 3
  }
}