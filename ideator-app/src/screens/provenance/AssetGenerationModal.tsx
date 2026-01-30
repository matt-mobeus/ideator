import { useState } from 'react'
import Modal from '@/components/composites/Modal.tsx'
import ProgressBar from '@/components/composites/ProgressBar.tsx'
import Button from '@/components/ui/Button.tsx'
import Icon from '@/components/ui/Icon.tsx'
import type { DocumentAssetType, VisualAssetType } from '@/types/asset.ts'
// TODO: Wire up real services when concept/analysis data is available
// import { generateDocument } from '@/services/document-generator.ts'
// import { generateVisual } from '@/services/visual-generator.ts'

interface AssetGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  conceptId: string
}

type AssetType = DocumentAssetType | VisualAssetType

const DOCUMENT_TYPES: { type: DocumentAssetType; label: string; icon: string }[] = [
  { type: 'executive_summary', label: 'Executive Summary', icon: '📄' },
  { type: 'pitch_deck', label: 'Pitch Deck', icon: '📊' },
  { type: 'one_pager', label: 'One-Pager', icon: '📃' },
  { type: 'technical_brief', label: 'Technical Brief', icon: '🔧' },
  { type: 'market_report', label: 'Market Report', icon: '📈' },
  { type: 'whitepaper', label: 'Whitepaper', icon: '📖' },
]

const VISUAL_TYPES: { type: VisualAssetType; label: string; icon: string }[] = [
  { type: 'infographic', label: 'Infographic', icon: '🎨' },
  { type: 'concept_diagram', label: 'Concept Diagram', icon: '📐' },
  { type: 'timeline_graphic', label: 'Timeline Graphic', icon: '📅' },
  { type: 'comparison_chart', label: 'Comparison Chart', icon: '📊' },
  { type: 'data_visualization', label: 'Data Visualization', icon: '📉' },
]

export default function AssetGenerationModal({
  isOpen,
  onClose,
}: AssetGenerationModalProps) {
  const [selectedType, setSelectedType] = useState<AssetType | null>(null)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedType) return

    setGenerating(true)
    setProgress(0)
    setError(null)

    try {
      // TODO: Get actual concept and analysis data
      // For now, this is a placeholder that needs concept data from parent
      // const concept = await fetchConcept(conceptId)
      // const analysis = await fetchAnalysis(conceptId)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 300)

      // Generate asset using real services
      // const isDocument = DOCUMENT_TYPES.some(t => t.type === selectedType)
      // const provider = { name: 'openai', apiKey: '' } // TODO: Get from settings
      // const asset = isDocument
      //   ? await generateDocument(selectedType as DocumentAssetType, concept, provider, analysis)
      //   : await generateVisual(selectedType as VisualAssetType, concept, provider, analysis)

      clearInterval(progressInterval)
      setProgress(100)
      setGenerating(false)
      setCompleted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      setGenerating(false)
    }
  }

  const handleClose = () => {
    setSelectedType(null)
    setGenerating(false)
    setProgress(0)
    setCompleted(false)
    onClose()
  }

  return (
    <Modal open={isOpen} onClose={handleClose} title="Generate Asset">
      <div className="flex flex-col gap-6">
        {/* Document types */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Documents
          </h3>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {DOCUMENT_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                disabled={generating || completed}
                className="flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:scale-105"
                style={{
                  backgroundColor:
                    selectedType === type ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                  borderColor:
                    selectedType === type ? 'var(--color-cyan)' : 'var(--border-subtle)',
                  borderWidth: selectedType === type ? '2px' : '1px',
                  cursor: generating || completed ? 'not-allowed' : 'pointer',
                  opacity: generating || completed ? 'var(--opacity-muted)' : 1,
                }}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-center" style={{ color: 'var(--text-primary)' }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual types */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Visuals
          </h3>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {VISUAL_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                disabled={generating || completed}
                className="flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:scale-105"
                style={{
                  backgroundColor:
                    selectedType === type ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                  borderColor:
                    selectedType === type ? 'var(--color-cyan)' : 'var(--border-subtle)',
                  borderWidth: selectedType === type ? '2px' : '1px',
                  cursor: generating || completed ? 'not-allowed' : 'pointer',
                  opacity: generating || completed ? 'var(--opacity-muted)' : 1,
                }}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-center" style={{ color: 'var(--text-primary)' }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress section */}
        {generating && (
          <div className="flex flex-col gap-2">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Generating {selectedType?.replace(/_/g, ' ')}...
            </p>
            <ProgressBar value={progress} />
          </div>
        )}

        {/* Error section */}
        {error && (
          <div
            className="flex flex-col gap-2 rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--color-red)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-red)' }}>
              Generation Failed
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Preview section */}
        {completed && !error && (
          <div
            className="flex flex-col gap-2 rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Preview Available
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Your {selectedType?.replace(/_/g, ' ')} has been generated successfully.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {completed && !error ? (
            <Button variant="primary" onClick={() => {/* TODO: Implement download */}}>
              <Icon name="download" />
              Download
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={!selectedType || generating}
            >
              Generate
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
