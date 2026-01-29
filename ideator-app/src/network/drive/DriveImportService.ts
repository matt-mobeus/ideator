// ============================================================================
// IDEATOR — Drive Import Orchestrator (NET-4.3)
// Full folder import flow with progress tracking
// ============================================================================

import { GoogleDriveClient, type DriveFile } from './GoogleDriveClient';

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

/** Result of importing a single file */
export interface ImportedFile {
  driveFile: DriveFile;
  blob: Blob;
}

const GOOGLE_DOC_EXPORT_TYPES: Record<string, string> = {
  'application/vnd.google-apps.document': 'application/pdf',
  'application/vnd.google-apps.spreadsheet': 'text/csv',
  'application/vnd.google-apps.presentation': 'application/pdf',
};

export class DriveImportService {
  private driveClient: GoogleDriveClient;

  constructor(driveClient: GoogleDriveClient) {
    this.driveClient = driveClient;
  }

  /**
   * Import all supported files from a Google Drive folder.
   * Recursively enumerates subfolders.
   * Yields progress events.
   */
  async *importFolder(folderId: string): AsyncGenerator<ImportProgress & { file?: ImportedFile }> {
    const allFiles = await this.enumerateRecursive(folderId);
    const total = allFiles.length;

    for (let i = 0; i < allFiles.length; i++) {
      const driveFile = allFiles[i];

      yield {
        totalFiles: total,
        currentFileIndex: i + 1,
        currentFileName: driveFile.name,
        bytesDownloaded: 0,
        totalBytes: driveFile.size,
        done: false,
      };

      try {
        let blob: Blob;
        const exportType = GOOGLE_DOC_EXPORT_TYPES[driveFile.mimeType];
        if (exportType) {
          blob = await this.driveClient.exportGoogleDoc(driveFile.id, exportType);
        } else {
          blob = await this.driveClient.downloadFile(driveFile.id);
        }

        yield {
          totalFiles: total,
          currentFileIndex: i + 1,
          currentFileName: driveFile.name,
          bytesDownloaded: blob.size,
          totalBytes: blob.size,
          done: false,
          file: { driveFile, blob },
        };
      } catch {
        // Continue on individual failures — skip this file
      }
    }

    yield {
      totalFiles: total,
      currentFileIndex: total,
      currentFileName: '',
      bytesDownloaded: 0,
      totalBytes: 0,
      done: true,
    };
  }

  private async enumerateRecursive(folderId: string): Promise<DriveFile[]> {
    const files: DriveFile[] = [];
    const contents = await this.driveClient.listFolderContents(folderId);

    for (const item of contents) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        const subFiles = await this.enumerateRecursive(item.id);
        files.push(...subFiles);
      } else {
        files.push(item);
      }
    }

    return files;
  }
}