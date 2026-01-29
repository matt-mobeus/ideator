// ============================================================================
// IDEATOR — File Format Detection (BE-2.1)
// Detects file type from magic bytes, extension, and MIME type
// ============================================================================

import { FileFormatCategory, SUPPORTED_EXTENSIONS } from '../../shared/types';

/** Detected format information */
export interface FormatInfo {
  /** File extension (lowercase, with dot) */
  extension: string;
  /** MIME type */
  mimeType: string;
  /** Format category */
  category: FileFormatCategory;
  /** Whether this format is supported */
  supported: boolean;
  /** Human-readable format name */
  formatName: string;
}

/** Magic byte signatures for common file types */
const MAGIC_BYTES: Array<{ bytes: number[]; offset: number; mimeType: string; extension: string }> = [
  { bytes: [0x25, 0x50, 0x44, 0x46], offset: 0, mimeType: 'application/pdf', extension: '.pdf' },
  { bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0, mimeType: 'application/zip', extension: '.zip' }, // ZIP-based (DOCX, XLSX, PPTX, EPUB)
  { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0, mimeType: 'image/png', extension: '.png' },
  { bytes: [0xff, 0xd8, 0xff], offset: 0, mimeType: 'image/jpeg', extension: '.jpg' },
  { bytes: [0x47, 0x49, 0x46, 0x38], offset: 0, mimeType: 'image/gif', extension: '.gif' },
  { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, mimeType: 'video/avi', extension: '.avi' }, // RIFF container
  { bytes: [0x49, 0x44, 0x33], offset: 0, mimeType: 'audio/mpeg', extension: '.mp3' }, // ID3 tag
  { bytes: [0xff, 0xfb], offset: 0, mimeType: 'audio/mpeg', extension: '.mp3' }, // MP3 frame sync
  { bytes: [0x00, 0x00, 0x00], offset: 0, mimeType: 'video/mp4', extension: '.mp4' }, // ftyp box (partial)
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], offset: 0, mimeType: 'video/webm', extension: '.webm' }, // EBML
];

/** Map of MIME types to format names */
const FORMAT_NAMES: Record<string, string> = {
  'application/pdf': 'PDF Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'application/msword': 'Word Document (Legacy)',
  'text/plain': 'Plain Text',
  'text/rtf': 'Rich Text',
  'application/epub+zip': 'EPUB',
  'text/markdown': 'Markdown',
  'text/html': 'HTML Document',
  'application/x-tex': 'LaTeX Document',
  'video/mp4': 'MP4 Video',
  'video/quicktime': 'QuickTime Video',
  'video/webm': 'WebM Video',
  'video/x-msvideo': 'AVI Video',
  'audio/mpeg': 'MP3 Audio',
  'audio/wav': 'WAV Audio',
  'audio/x-m4a': 'M4A Audio',
  'audio/ogg': 'OGG Audio',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  'application/vnd.ms-powerpoint': 'PowerPoint (Legacy)',
  'image/png': 'PNG Image',
  'image/jpeg': 'JPEG Image',
  'image/gif': 'GIF Image',
  'image/webp': 'WebP Image',
  'image/tiff': 'TIFF Image',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
  'application/vnd.ms-excel': 'Excel Spreadsheet (Legacy)',
  'text/csv': 'CSV File',
  'application/json': 'JSON File',
};

/** Map extensions to MIME types for fallback */
const EXTENSION_TO_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.txt': 'text/plain',
  '.rtf': 'text/rtf',
  '.epub': 'application/epub+zip',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.tex': 'application/x-tex',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/x-m4a',
  '.ogg': 'audio/ogg',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.key': 'application/x-iwork-keynote-sffkey',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.tiff': 'image/tiff',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.csv': 'text/csv',
  '.json': 'application/json',
};

export class FileFormatDetector {
  /**
   * Detect the format of a file from its metadata and content.
   */
  detect(file: File): FormatInfo {
    const extension = this.getExtension(file.name);
    const mimeType = this.resolveMimeType(file.type, extension);
    const category = this.categorize(extension);
    const supported = this.isSupported(extension);
    const formatName = FORMAT_NAMES[mimeType] ?? `Unknown (${extension || 'no extension'})`;

    return { extension, mimeType, category, supported, formatName };
  }

  /**
   * Detect format using magic bytes from file header.
   * Call this for more accurate detection of binary files.
   */
  async detectFromBytes(file: File): Promise<FormatInfo> {
    const basicInfo = this.detect(file);

    // Read first 16 bytes for magic byte detection
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const header = new Uint8Array(buffer);

    for (const sig of MAGIC_BYTES) {
      if (this.matchesSignature(header, sig.bytes, sig.offset)) {
        // For ZIP-based formats, use extension to differentiate
        if (sig.mimeType === 'application/zip') {
          return basicInfo; // Extension-based detection is more specific for ZIP containers
        }
        const mimeType = sig.mimeType;
        const extension = basicInfo.extension || sig.extension;
        const category = this.categorize(extension);
        return {
          extension,
          mimeType,
          category,
          supported: this.isSupported(extension),
          formatName: FORMAT_NAMES[mimeType] ?? basicInfo.formatName,
        };
      }
    }

    return basicInfo;
  }

  /** Check if a file extension is in the supported list */
  isSupported(extension: string): boolean {
    const ext = extension.toLowerCase() as any;
    return (
      SUPPORTED_EXTENSIONS.text.includes(ext) ||
      SUPPORTED_EXTENSIONS.multimedia.includes(ext) ||
      SUPPORTED_EXTENSIONS.structured.includes(ext)
    );
  }

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.slice(lastDot).toLowerCase();
  }

  private resolveMimeType(browserMime: string, extension: string): string {
    // Prefer browser-reported MIME if it's not generic
    if (browserMime && browserMime !== 'application/octet-stream') {
      return browserMime;
    }
    return EXTENSION_TO_MIME[extension] ?? 'application/octet-stream';
  }

  private categorize(extension: string): FileFormatCategory {
    const ext = extension.toLowerCase() as any;
    if (SUPPORTED_EXTENSIONS.text.includes(ext)) return FileFormatCategory.TEXT;
    if (SUPPORTED_EXTENSIONS.multimedia.includes(ext)) return FileFormatCategory.MULTIMEDIA;
    if (SUPPORTED_EXTENSIONS.structured.includes(ext)) return FileFormatCategory.STRUCTURED;
    return FileFormatCategory.TEXT; // default
  }

  private matchesSignature(header: Uint8Array, bytes: number[], offset: number): boolean {
    for (let i = 0; i < bytes.length; i++) {
      if (header[offset + i] !== bytes[i]) return false;
    }
    return true;
  }
}
