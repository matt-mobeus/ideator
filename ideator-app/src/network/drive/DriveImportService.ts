// ============================================================================
// IDEATOR — Drive Import Orchestrator (NET-4.3)
// Full folder import flow with progress tracking
// ============================================================================

/** Progress event during Drive import */
export interface ImportProgress {
  /** Total files to import */
  totalFiles: number;
  /** Current file index (1-based) */
  currentFileIndex: number;
  /** Current file name */
  currentFileName: string;
  /** Bytes downloaded so far for current file */
  bytesDownloaded: number;
  /** Total bytes of current file */
  totalBytes: number;
  /** Whether import is complete */
  done: boolean;
}

export class DriveImportService {
  constructor() {}

  /**
   * Import all supported files from a Google Drive folder.
   * Recursively enumerates subfolders.
   * Yields progress events.
   */
  async *importFolder(
    _folderId: string
  ): AsyncGenerator<ImportProgress> {
    // TODO: List folder contents recursively
    // TODO: Filter to supported formats
    // TODO: Download each file, emit progress
    // TODO: Continue on individual failures
    throw new Error('DriveImportService.importFolder not yet implemented');
  }
}
