import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Concept } from '@/types/concept.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Breadcrumb from '@/components/composites/Breadcrumb.tsx'
import Button from '@/components/ui/Button.tsx'
import Icon from '@/components/ui/Icon.tsx'
import SourcePanel from './SourcePanel.tsx'
import ClaimsPanel from './ClaimsPanel.tsx'
import AssetGenerationModal from './AssetGenerationModal.tsx'
import { MOCK_CONCEPTS, MOCK_CLAIMS } from '@/fixtures/provenance-mock-data.ts'

// ── Helpers ───────────────────────────────────────────────────────────

interface SourceExcerpt {
  location: string
  text: string
}

interface GroupedSource {
  fileId: string
  fileName: string
  excerpts: SourceExcerpt[]
}

function groupSourcesByFile(concept: Concept): GroupedSource[] {
  const groups = new Map<string, GroupedSource>()

  concept.sourceReferences.forEach((ref) => {
    if (!groups.has(ref.fileId)) {
      groups.set(ref.fileId, {
        fileId: ref.fileId,
        fileName: ref.fileName,
        excerpts: [],
      })
    }
    groups.get(ref.fileId)!.excerpts.push({
      location: ref.location,
      text: ref.excerpt,
    })
  })

  return Array.from(groups.values())
}

// ── Screen ────────────────────────────────────────────────────────────

export default function ProvenanceScreen() {
  const { id: conceptId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [useMock] = useState(true)
  const [highlightedFileId, setHighlightedFileId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const concepts: Concept[] = useMock ? MOCK_CONCEPTS : []
  const concept = concepts.find((c) => c.id === conceptId)

  const claims: Claim[] = useMock && concept ? MOCK_CLAIMS : []
  const sources = concept ? groupSourcesByFile(concept) : []

  const handleExcerptHover = (fileId: string | null) => {
    setHighlightedFileId(fileId)
  }

  const handleClaimHover = (sourceFileIds: string[] | null) => {
    // Highlight the first file when hovering over a claim
    setHighlightedFileId(sourceFileIds && sourceFileIds.length > 0 ? sourceFileIds[0] : null)
  }

  if (!concept) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title="Concept not found"
          description="The requested concept does not exist."
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb
          items={[
            { label: 'Concepts', onClick: () => navigate('/concepts') },
            { label: concept.name, onClick: () => navigate(`/concepts/${concept.id}`) },
            { label: 'Provenance' },
          ]}
        />
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Icon name="plus" />
          Generate Asset
        </Button>
      </div>

      {/* Split panel layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left panel - Sources (40%) */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: '40%', minWidth: '300px' }}
        >
          <SourcePanel
            sources={sources}
            highlightedFileId={highlightedFileId || undefined}
            onExcerptHover={handleExcerptHover}
          />
        </div>

        {/* Right panel - Claims (60%) */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: '60%', minWidth: '400px' }}
        >
          <ClaimsPanel
            claims={claims}
            highlightedFileId={highlightedFileId || undefined}
            onClaimHover={handleClaimHover}
          />
        </div>
      </div>

      {/* Asset generation modal */}
      <AssetGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        conceptId={concept.id}
      />
    </div>
  )
}
