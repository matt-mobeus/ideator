// ============================================================================
// IDEATOR — Google Drive API Client (NET-4.2)
// File listing, metadata, and download from Google Drive
// ============================================================================

import { GoogleAuthService } from './GoogleAuthService';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';

const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'audio/wav',
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
]);

/** Google Drive file metadata */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  modifiedTime: Date;
  parents?: string[];
}

export class GoogleDriveClient {
  private auth: GoogleAuthService;

  constructor(auth: GoogleAuthService) {
    this.auth = auth;
  }

  /** List all files in a folder */
  async listFolderContents(folderId: string): Promise<DriveFile[]> {
    const files: DriveFile[] = [];
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, parents)',
        pageSize: '100',
      });
      if (pageToken) params.set('pageToken', pageToken);

      const response = await this.request(`/files?${params.toString()}`);
      const data = await response.json();

      for (const f of data.files ?? []) {
        if (SUPPORTED_MIME_TYPES.has(f.mimeType)) {
          files.push({
            id: f.id,
            name: f.name,
            mimeType: f.mimeType,
            size: Number(f.size ?? 0),
            modifiedTime: new Date(f.modifiedTime),
            parents: f.parents,
          });
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    return files;
  }

  /** Get metadata for a single file */
  async getFileMetadata(fileId: string): Promise<DriveFile> {
    const params = new URLSearchParams({
      fields: 'id, name, mimeType, size, modifiedTime, parents',
    });
    const response = await this.request(`/files/${fileId}?${params.toString()}`);
    const f = await response.json();
    return {
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: Number(f.size ?? 0),
      modifiedTime: new Date(f.modifiedTime),
      parents: f.parents,
    };
  }

  /** Download file content as blob */
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await this.request(`/files/${fileId}?alt=media`);
    return response.blob();
  }

  /** Export a Google Doc to the specified mimeType (e.g. application/pdf) */
  async exportGoogleDoc(fileId: string, mimeType: string): Promise<Blob> {
    const params = new URLSearchParams({ mimeType });
    const response = await this.request(`/files/${fileId}/export?${params.toString()}`);
    return response.blob();
  }

  /** Check if a mime type is a Google Workspace doc that needs export */
  isGoogleWorkspaceFile(mimeType: string): boolean {
    return mimeType.startsWith('application/vnd.google-apps.');
  }

  private async request(path: string): Promise<Response> {
    const token = await this.auth.getAccessToken();
    const response = await fetch(`${DRIVE_API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Drive API error ${response.status}: ${await response.text()}`);
    }
    return response;
  }
}