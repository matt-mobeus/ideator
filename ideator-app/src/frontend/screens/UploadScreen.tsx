// ============================================================================
// IDEATOR — Screen 1: Upload & Ingest (FE-4.x)
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/primitives';
import { Card, ProgressBar, EmptyState } from '../components/composite';
import { useToast } from '../contexts/ToastContext';
import { useProcessing } from '../hooks/useProcessing';
import { useAppState } from '../contexts/AppStateContext';
import { SUPPORTED_EXTENSIONS } from '../../shared/types';

const ALL_EXTENSIONS = [
  ...SUPPORTED_EXTENSIONS.text,
  ...SUPPORTED_EXTENSIONS.multimedia,
  ...SUPPORTED_EXTENSIONS.structured,
];

interface QueuedFile {
  file: File;
  id: string;
}

export function UploadScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh, storage } = useAppState();
  const { processing, progress, processFiles } = useProcessing(storage);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSupported = (name: string): boolean => {
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    return ALL_EXTENSIONS.includes(ext as any);
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: QueuedFile[] = [];
    for (const file of Array.from(files)) {
      if (!isSupported(file.name)) {
        toast.warning(`Unsupported format: ${file.name}`);
        continue;
      }
      newFiles.push({ file, id: crypto.randomUUID() });
    }
    setQueue((prev) => [...prev, ...newFiles]);
  }, [toast]);

  const removeFile = (id: string) => setQueue((prev) => prev.filter((f) => f.id !== id));
  const clearQueue = () => setQueue([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleIngest = async () => {
    if (queue.length === 0) return;
    const files = queue.map((q) => q.file);
    const results = await processFiles(files);
    if (results.length > 0) {
      toast.success(`Processed ${results.length} file${results.length > 1 ? 's' : ''} successfully`);
      setQueue([]);
      await refresh();
      navigate('/concepts');
    } else {
      toast.error('All files failed to process');
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = queue.reduce((sum, q) => sum + q.file.size, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-[var(--accent-nav)]" style={{ fontFamily: 'var(--font-heading)' }}>
        Upload &amp; Ingest
      </h1>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[var(--radius-md)] p-16 text-center mb-6 cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-[var(--accent-nav)] bg-[var(--accent-nav)]/5 shadow-[0_0_20px_rgba(0,255,255,0.15)]'
            : 'border-[var(--bg-tertiary)] hover:border-[var(--accent-nav)]/50'
        }`}
      >
        <p className="text-[var(--text-secondary)] mb-2">Drag files here or click to upload</p>
        <p className="text-xs text-[var(--text-tertiary)]">
          Supports PDF, DOCX, TXT, MP4, MP3, PPTX, CSV, JSON, and more
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={ALL_EXTENSIONS.join(',')}
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-secondary)]">
              {queue.length} file{queue.length !== 1 ? 's' : ''} · {formatSize(totalSize)}
            </span>
            <Button variant="secondary" onClick={clearQueue}>Clear All</Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queue.map((q) => (
              <div key={q.id} className="flex items-center justify-between px-3 py-2 bg-[var(--bg-primary)] rounded-[var(--radius-sm)]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-[var(--text-tertiary)]">📄</span>
                  <span className="text-sm truncate">{q.file.name}</span>
                  <span className="text-xs text-[var(--text-tertiary)] shrink-0">{formatSize(q.file.size)}</span>
                </div>
                <button onClick={() => removeFile(q.id)} className="text-[var(--text-tertiary)] hover:text-[var(--accent-danger)] ml-2 shrink-0">×</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Processing progress */}
      {processing && progress && (
        <Card className="mb-6">
          <ProgressBar
            value={progress.overallProgress}
            label={`Processing: ${progress.currentFileName}`}
            phase={progress.phase}
          />
          {progress.failedFiles.length > 0 && (
            <div className="mt-3">
              {progress.failedFiles.map((f, i) => (
                <p key={i} className="text-xs text-[var(--accent-warning)]">{f.name}: {f.error}</p>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Ingest button */}
      <div className="flex justify-end">
        <Button
          onClick={handleIngest}
          disabled={queue.length === 0 || processing}
          loading={processing}
          className={queue.length > 0 && !processing ? 'shadow-[0_0_16px_rgba(0,255,255,0.4)]' : ''}
        >
          Begin Ingestion
        </Button>
      </div>

      {queue.length === 0 && !processing && (
        <EmptyState
          title="No files queued"
          description="Add documents, videos, audio, or data files to begin concept extraction"
        />
      )}
    </div>
  );
}
