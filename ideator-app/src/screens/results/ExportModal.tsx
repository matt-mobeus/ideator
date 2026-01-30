import type { AnalysisResult } from '@/types/analysis.ts'
import Modal from '@/components/composites/Modal.tsx'
import Button from '@/components/ui/Button.tsx'
import Badge from '@/components/ui/Badge.tsx'

interface ExportModalProps {
  results: AnalysisResult[]
  isOpen: boolean
  onClose: () => void
}

export default function ExportModal({ results, isOpen, onClose }: ExportModalProps) {
  const handleExportJSON = () => {
    // TODO(#backlog): Implement actual JSON export with proper formatting and file download when export utility is ready
  }

  const handleExportCSV = () => {
    // TODO(#backlog): Implement actual CSV export with column mapping when export utility is ready
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Export Results">
      <div className="flex flex-col gap-4">
        {/* Count */}
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--text-secondary)' }}>
            Exporting
          </span>
          <Badge variant="cyan">{results.length}</Badge>
          <span style={{ color: 'var(--text-secondary)' }}>
            {results.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {/* Export Options */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleExportJSON}
            variant="primary"
            className="w-full justify-start gap-3"
          >
            <span className="text-xl">📄</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Export as JSON</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Machine-readable format with full details
              </span>
            </div>
          </Button>

          <Button
            onClick={handleExportCSV}
            variant="primary"
            className="w-full justify-start gap-3"
          >
            <span className="text-xl">📊</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Export as CSV</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Spreadsheet-friendly format for analysis
              </span>
            </div>
          </Button>
        </div>

        {/* Cancel */}
        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
