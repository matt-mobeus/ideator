import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Concept } from '@/types/concept.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Breadcrumb from '@/components/composites/Breadcrumb.tsx'
import ConceptDetail from './ConceptDetail.tsx'
import AnalysisTrigger from './AnalysisTrigger.tsx'
import { MOCK_CONCEPTS, MOCK_ANALYSIS, MOCK_JOB } from '@/fixtures/analyze-mock-data.ts'

// ── Screen ────────────────────────────────────────────────────────────

export default function AnalyzeScreen() {
  const { id: conceptId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [useMock] = useState(true)

  const concepts: Concept[] = useMock ? MOCK_CONCEPTS : []
  const concept = concepts.find((c) => c.id === conceptId)

  // Mock: Show analysis for c2, show running job for c1
  const existingAnalysis = useMock && conceptId === 'c2' ? MOCK_ANALYSIS : undefined
  const currentJob = useMock && conceptId === 'c1' ? MOCK_JOB : undefined

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
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Concepts', onClick: () => navigate('/concepts') },
          { label: concept.name, onClick: () => navigate(`/concepts/${concept.id}`) },
          { label: 'Analyze' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto md:flex-row">
        <div className="flex-1">
          <ConceptDetail concept={concept} />
        </div>
        <div className="w-full md:w-96">
          <AnalysisTrigger
            conceptId={concept.id}
            existingAnalysis={existingAnalysis}
            currentJob={currentJob}
          />
        </div>
      </div>
    </div>
  )
}
