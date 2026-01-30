export type FileFormat =
  | 'pdf' | 'docx' | 'doc' | 'txt' | 'rtf' | 'epub' | 'md' | 'html' | 'htm' | 'tex' | 'latex'
  | 'mp4' | 'mov' | 'webm' | 'avi' | 'mp3' | 'wav' | 'm4a' | 'ogg'
  | 'pptx' | 'ppt' | 'key'
  | 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'tiff'
  | 'xlsx' | 'xls' | 'csv' | 'json'

export type FileCategory = 'text' | 'multimedia' | 'structured'

export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface SourceFile {
  id: string
  name: string
  size: number
  format: FileFormat
  category: FileCategory
  mimeType: string
  blob?: Blob
  extractedText?: string
  processingStatus: ProcessingStatus
  processingProgress: number
  errorMessage?: string
  uploadedAt: Date
  processedAt?: Date
}
