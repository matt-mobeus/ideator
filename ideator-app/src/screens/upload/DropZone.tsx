import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { clsx } from 'clsx'
import Icon from '@/components/ui/Icon.tsx'

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void
}

const SUPPORTED_FORMATS = [
  'pdf', 'docx', 'doc', 'txt', 'rtf', 'epub', 'md', 'html', 'htm', 'tex', 'latex',
  'mp4', 'mov', 'webm', 'avi', 'mp3', 'wav', 'm4a', 'ogg',
  'pptx', 'ppt', 'key',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'tiff',
  'xlsx', 'xls', 'csv', 'json',
]

export default function DropZone({ onFilesAdded }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = (files: FileList | null): File[] => {
    if (!files) return []

    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext && SUPPORTED_FORMATS.includes(ext)) {
        validFiles.push(file)
      }
    }
    return validFiles
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const validFiles = validateFiles(e.dataTransfer.files)
    if (validFiles.length > 0) {
      onFilesAdded(validFiles)
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files)
    if (validFiles.length > 0) {
      onFilesAdded(validFiles)
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={clsx(
        'relative flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border-2 border-dashed p-12 transition-all duration-[var(--transition-default)] cursor-pointer',
        isDragging
          ? 'border-[var(--color-cyan)] bg-[rgba(0,255,255,0.05)] shadow-[var(--glow-cyan-lg)]'
          : 'border-[var(--border-default)] hover:border-[var(--color-cyan)] hover:shadow-[var(--glow-cyan-md)]',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="File upload input"
      />

      <Icon
        name="upload"
        size={24}
        className={clsx(
          'transition-colors duration-[var(--transition-default)]',
          isDragging ? 'text-[var(--color-cyan)]' : 'text-[var(--text-muted)]',
        )}
      />

      <div className="flex flex-col items-center gap-2">
        <p
          className={clsx(
            'text-sm font-medium uppercase tracking-wide transition-colors duration-[var(--transition-default)]',
            isDragging ? 'text-[var(--color-cyan)]' : 'text-[var(--text-primary)]',
          )}
        >
          DRAG & DROP FILES HERE
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          or click to browse
        </p>
      </div>
    </div>
  )
}
