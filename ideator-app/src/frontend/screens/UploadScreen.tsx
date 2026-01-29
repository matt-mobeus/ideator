// ============================================================================
// IDEATOR — Screen 1: Upload & Ingest (FE-4.x)
// ============================================================================

export function UploadScreen() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1
        className="text-3xl font-bold mb-8 text-[var(--accent-nav)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Upload & Ingest
      </h1>

      {/* TODO FE-4.2: Drag-and-drop zone */}
      <div className="border-2 border-dashed border-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-16 text-center mb-6 hover:border-[var(--accent-nav)] transition-colors">
        <p className="text-[var(--text-secondary)] mb-2">
          Drag files here or click to upload
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          Supports PDF, DOCX, TXT, MP4, MP3, PPTX, CSV, JSON, and more
        </p>
      </div>

      {/* TODO FE-4.3: Google Drive linker */}
      {/* TODO FE-4.4: Upload queue display */}
      {/* TODO FE-4.5: Ingestion trigger & progress */}
    </div>
  );
}
