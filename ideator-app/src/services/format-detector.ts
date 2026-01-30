import type { FileFormat, FileCategory } from '@/types/file.ts'

interface FormatInfo {
  format: FileFormat
  category: FileCategory
}

const FORMAT_MAP: Record<string, FormatInfo> = {
  // Text formats
  pdf: { format: 'pdf', category: 'text' },
  docx: { format: 'docx', category: 'text' },
  doc: { format: 'doc', category: 'text' },
  txt: { format: 'txt', category: 'text' },
  rtf: { format: 'rtf', category: 'text' },
  epub: { format: 'epub', category: 'text' },
  md: { format: 'md', category: 'text' },
  html: { format: 'html', category: 'text' },
  htm: { format: 'htm', category: 'text' },
  tex: { format: 'tex', category: 'text' },
  latex: { format: 'latex', category: 'text' },

  // Multimedia formats - video
  mp4: { format: 'mp4', category: 'multimedia' },
  mov: { format: 'mov', category: 'multimedia' },
  webm: { format: 'webm', category: 'multimedia' },
  avi: { format: 'avi', category: 'multimedia' },

  // Multimedia formats - audio
  mp3: { format: 'mp3', category: 'multimedia' },
  wav: { format: 'wav', category: 'multimedia' },
  m4a: { format: 'm4a', category: 'multimedia' },
  ogg: { format: 'ogg', category: 'multimedia' },

  // Multimedia formats - presentations
  pptx: { format: 'pptx', category: 'multimedia' },
  ppt: { format: 'ppt', category: 'multimedia' },
  key: { format: 'key', category: 'multimedia' },

  // Multimedia formats - images
  png: { format: 'png', category: 'multimedia' },
  jpg: { format: 'jpg', category: 'multimedia' },
  jpeg: { format: 'jpeg', category: 'multimedia' },
  gif: { format: 'gif', category: 'multimedia' },
  webp: { format: 'webp', category: 'multimedia' },
  tiff: { format: 'tiff', category: 'multimedia' },

  // Structured formats
  xlsx: { format: 'xlsx', category: 'structured' },
  xls: { format: 'xls', category: 'structured' },
  csv: { format: 'csv', category: 'structured' },
  json: { format: 'json', category: 'structured' },
}

export function detectFormat(file: File): { format: FileFormat; category: FileCategory } {
  const extension = getFileExtension(file.name)
  const formatInfo = FORMAT_MAP[extension]

  if (!formatInfo) {
    throw new Error(`Unsupported file format: ${extension}`)
  }

  return formatInfo
}

export function isSupported(file: File): boolean {
  const extension = getFileExtension(file.name)
  return extension in FORMAT_MAP
}

export function getSupportedExtensions(): string[] {
  return Object.keys(FORMAT_MAP)
}

function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}
