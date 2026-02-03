import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Concept } from '@/types/concept.ts'
import type { Claim } from '@/types/asset.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Button from '@/components/ui/Button.tsx'
import Icon from '@/components/ui/Icon.tsx'
import { PageHeader, SplitPanel } from '@/components/global'
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
    <div className="flex h-full flex-col gap-6">
      <PageHeader
        title={`${concept.name} — Provenance`}
        actions={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Icon name="plus" />
            Generate Asset
          </Button>
        }
      />

      <SplitPanel
        sidebarWidth="40%"
        sidebar={
          <SourcePanel
            sources={sources}
            highlightedFileId={highlightedFileId || undefined}
            onExcerptHover={handleExcerptHover}
          />
        }
      >
        <ClaimsPanel
          claims={claims}
          highlightedFileId={highlightedFileId || undefined}
          onClaimHover={handleClaimHover}
        />
      </SplitPanel>

      <AssetGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        conceptId={concept.id}
      />
    </div>
  )
}
